package app

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	stmongo "st/backend/app/mongo"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/vicanso/go-charts/v2"
)

type App struct {
	server *gin.Engine
}

func New() *App {
	return &App{
		server: gin.Default(),
	}
}

type ActivityData struct {
	name     []string
	duration []float64
}

type Emoji struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type EmojiResponse struct {
	Items []Emoji `json:"items"`
}

type FormattedEmojiJSON map[string]string

var (
	emojis      FormattedEmojiJSON
	emojisMutex sync.RWMutex
)

func activityDataCreate() *ActivityData {
	return &ActivityData{
		name:     make([]string, 0),
		duration: make([]float64, 0),
	}
}

func (actd *ActivityData) push_name(element string) {
	actd.name = append(actd.name, element)
}

func (actd *ActivityData) push_dur(element float64) {
	actd.duration = append(actd.duration, element)
}

func fetchRemoteEmojis() (FormattedEmojiJSON, error) {
	url := fmt.Sprintf("https://discord.com/api/v10/applications/%s/emojis", os.Getenv("CLIENT_ID"))

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bot "+os.Getenv("CLIENT_TOKEN"))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch emojis, status code: %d", resp.StatusCode)
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var emojiResponse EmojiResponse
	if err := json.Unmarshal(body, &emojiResponse); err != nil {
		return nil, err
	}

	formatted := make(FormattedEmojiJSON)
	for _, emoji := range emojiResponse.Items {
		formatted[emoji.ID] = emoji.Name
	}

	return formatted, nil
}

func refreshEmojis() {
	for {
		updatedEmojis, err := fetchRemoteEmojis()
		if err != nil {
			fmt.Printf("Failed to fetch emojis: %v\n", err)
		} else {
			emojisMutex.Lock()
			emojis = updatedEmojis
			emojisMutex.Unlock()
			fmt.Printf("Successfully refreshed emojis, total: %d\n", len(updatedEmojis))
		}
		time.Sleep(15 * time.Minute)
	}
}

/*
	type MongoStore struct {
		collection *mongo.Collection
		expiration time.Duration
	}

// NewMongoStore creates a new instance of MongoStore

	func NewMongoStore(collection *mongo.Collection, expiration time.Duration) *MongoStore {
		return &MongoStore{
			collection: collection,
			expiration: expiration,
		}
	}

// Get retrieves a session value from MongoDB

	func (s *MongoStore) Get(r *http.Request, key string) (*sessions.Session, error) {
		var session sessions.Session
		session.ID = key
		err := s.collection.FindOne(context.Background(), bson.M{"key": key}).Decode(&session)
		if err != nil {
			return nil, err
		}
		return &session, nil
	}

// Set stores a session in MongoDB

	func (s *MongoStore) Set(r *http.Request, key string, value *sessions.Session) error {
		_, err := s.collection.UpdateOne(
			context.Background(),
			bson.M{"key": key},
			bson.M{
				"$set": bson.M{
					"data":      value,
					"expiresAt": time.Now().Add(s.expiration),
				},
			},
			options.Update().SetUpsert(true),
		)
		return err
	}

// Delete removes a session from MongoDB

	func (s *MongoStore) Delete(r *http.Request, key string) error {
		_, err := s.collection.DeleteOne(context.Background(), bson.M{"key": key})
		return err
	}

// Options is an empty function as it won't apply to MongoDB
func (s *MongoStore) Options(options sessions.Options) {}
*/
func (a *App) Run() {
	go refreshEmojis()
	mongoc := stmongo.Initialize()

	// OAuth2

	// conf := &oauth2.Config{
	// 	RedirectURL:  os.Getenv("REDIRECT_URI"),
	// 	ClientID:     os.Getenv("CLIENT_ID"),
	// 	ClientSecret: os.Getenv("CLIENT_SECRET"),
	// 	Scopes:       []string{discord.ScopeIdentify},
	// 	Endpoint:     discord.Endpoint,
	// }

	/*
		client, err := mongo.NewClient(options.Client().ApplyURI(os.Getenv("MONGODB_URI")))
		if err != nil {
			panic(err)
		}
		if err := client.Connect(context.Background()); err != nil {
			panic(err)
		}

		collection := client.Database("session_db").Collection("sessions")
		store := NewMongoStore(collection, 24*time.Hour)

		a.server.Use(sessions.Sessions("mysession", store))
	*/

	// const state = "random22" // generate random state later

	// a.server.GET("/auth", func(c *gin.Context) {
	// 	/*
	// 		// Retrieve the session
	// 		session := sessions.Default(c)
	// 		userID := session.Get("user_id")

	// 		if userID != nil {
	// 			// User is already authenticated, return their data from the database
	// 			var user map[string]interface{}
	// 			err := store.collection.FindOne(context.Background(), bson.M{"id": userID}).Decode(&user)
	// 			if err != nil {
	// 				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user data"})
	// 				return
	// 			}

	// 			c.JSON(http.StatusOK, gin.H{
	// 				"message": "User already authenticated",
	// 				"user":    user,
	// 			})
	// 			return
	// 		}
	// 	*/
	// 	// If not authenticated, redirect to the Discord OAuth2 authorization page
	// 	c.Redirect(http.StatusTemporaryRedirect, conf.AuthCodeURL(state))
	// })

	// a.server.GET("/auth/callback", func(c *gin.Context) {
	// 	if c.Query("state") != state {
	// 		c.JSON(http.StatusBadRequest, gin.H{
	// 			"error": "Invalid state",
	// 		})
	// 		return
	// 	}

	// 	// Exchange authorization code for token
	// 	token, err := conf.Exchange(context.Background(), c.Query("code"))
	// 	if err != nil {
	// 		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	// 		return
	// 	}

	// 	// Get user info from Discord
	// 	client := conf.Client(context.Background(), token)
	// 	res, err := client.Get("https://discord.com/api/users/@me")
	// 	if err != nil {
	// 		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	// 		return
	// 	}
	// 	defer res.Body.Close()

	// 	body, err := ioutil.ReadAll(res.Body)
	// 	if err != nil {
	// 		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	// 		return
	// 	}

	// 	var userInfo map[string]interface{}
	// 	if err := json.Unmarshal(body, &userInfo); err != nil {
	// 		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	// 		return
	// 	}
	// 	/*
	// 		// Save user info in the database
	// 		_, err = store.collection.UpdateOne(
	// 			context.Background(),
	// 			bson.M{"id": userInfo["id"]},
	// 			bson.M{"$set": userInfo},
	// 			options.Update().SetUpsert(true),
	// 		)
	// 		if err != nil {
	// 			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save user data"})
	// 			return
	// 		}

	// 		// Save user ID in the session
	// 		session := sessions.Default(c)
	// 		session.Set("user_id", userInfo["id"])
	// 		if err := session.Save(); err != nil {
	// 			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save session"})
	// 			return
	// 		}
	// 	*/
	// 	c.JSON(http.StatusOK, gin.H{"message": "Authentication successful", "user": userInfo})
	// })

	a.server.GET("/emojis", func(c *gin.Context) {
		emojisMutex.RLock()
		defer emojisMutex.RUnlock()
		c.JSON(http.StatusOK, emojis)
	})

	a.server.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})

	a.server.GET("/user/:id", func(c *gin.Context) {
		id := c.Param("id")

		if err := stmongo.ValidateID(id); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		user := stmongo.FindUser(mongoc.Client, id)
		activities := stmongo.FindActivities(mongoc.Client, id)

		c.JSON(http.StatusOK, gin.H{
			"user":       user,
			"activities": activities,
		})
	})

	a.server.GET("/global", func(c *gin.Context) {
		activities := stmongo.FindAllActivities(mongoc.Client)

		c.JSON(http.StatusOK, gin.H{
			"activities": activities,
		})
	})

	activityList := activityDataCreate()

	a.server.GET("/user/:id/graph", func(c *gin.Context) {
		id := c.Param("id")

		if err := stmongo.ValidateID(id); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		activities := stmongo.FindActivities(mongoc.Client, id)

		for _, app := range activities {
			name := app["name"].(string)
			duration := app["duration"].(int32) / 60000

			activityList.push_name(name)
			activityList.push_dur(float64(duration))
		}

		fmt.Print(activityList)
		values := [][]float64{activityList.duration}

		png, err := charts.BarRender(
			values,
			charts.TitleTextOptionFunc("Minutes elapsed"),
			charts.XAxisDataOptionFunc(activityList.name),
			charts.WidthOptionFunc(1080),
			charts.HeightOptionFunc(720),
			charts.ThemeOptionFunc(charts.ThemeDark),
		)
		if err != nil {
			panic(err)
		}

		buf, err := png.Bytes()
		if err != nil {
			panic(err)
		}

		c.Header("Content-Type", "image/png")
		c.Data(http.StatusOK, "image/png", buf)

	})

	a.server.Run()

}
