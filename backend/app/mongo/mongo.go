package stmongo

import (
	"context"
	"errors"
	"log"
	"os"
	"regexp"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func init() {
	if err := godotenv.Load(); err != nil {
		log.Fatal("No .env file found")
	}
}

type Mongo struct {
	Client *mongo.Client
}

func Initialize() *Mongo {
	log.Println("Initializing MongoDB")
	uri := os.Getenv("MONGODB_URI")
	if uri == "" {
		log.Fatal("MONGODB_URI is not set")
	}

	client, err := mongo.Connect(context.TODO(), options.Client().ApplyURI(uri))
	if err != nil {
		panic(err)
	}

	return &Mongo{
		Client: client,
	}
}

func Close(m *Mongo) {
	if err := m.Client.Disconnect(context.TODO()); err != nil {
		log.Fatalf("Error disconnecting from MongoDB: %v", err)
	}
	log.Println("Disconnected from MongoDB")
}

func ValidateID(id string) error {
	if len(id) == 0 {
		return errors.New("ID cannot be empty")
	}

	regexNumeric := regexp.MustCompile(`^\d+$`)
	if !regexNumeric.MatchString(id) {
		return errors.New("ID must be numeric")
	}

	return nil
}

func FindUser(client *mongo.Client, id string) bson.M {
	coll := client.Database("production").Collection("users")

	if err := ValidateID(id); err != nil {
		return bson.M{"error": err.Error()}
	}

	var result bson.M
	err := coll.FindOne(context.TODO(), bson.D{{Key: "_id", Value: id}}, options.FindOne().SetProjection(bson.D{{Key: "__v", Value: 0}})).Decode(&result)
	if err != nil {
		log.Fatal(err)
	}

	return result
}

func FindActivities(client *mongo.Client, id string) []bson.M {
	coll := client.Database("production").Collection("activities")

	if err := ValidateID(id); err != nil {
		return []bson.M{{"error": err.Error()}}
	}

	cursor, err := coll.Find(context.TODO(), bson.D{{Key: "id", Value: id}}, options.Find().SetSort(bson.D{{Key: "duration", Value: -1}}).SetProjection(bson.D{{Key: "__v", Value: 0}, {Key: "_id", Value: 0}}))
	if err != nil {
		log.Fatal(err)
	}

	var results []bson.M
	if err = cursor.All(context.TODO(), &results); err != nil {
		log.Fatal(err)
	}

	return results
}

func makeTimestamp() int64 {
	return time.Now().UnixNano() / 1e6
}

func FindActivitiesPlaying(client *mongo.Client, id string) []bson.M {
	coll := client.Database("production").Collection("activities")

	if err := ValidateID(id); err != nil {
		return []bson.M{{"error": err.Error()}}
	}

	cursor, err := coll.Find(context.TODO(), bson.D{{Key: "id", Value: id}, {Key: "last_tracked", Value: bson.D{{Key: "$gt", Value: makeTimestamp() - (1000 * 60 * 3)}}}}, options.Find().SetSort(bson.D{{Key: "duration", Value: -1}}).SetProjection(bson.D{{Key: "__v", Value: 0}, {Key: "_id", Value: 0}}))
	if err != nil {
		log.Fatal(err)
	}

	var results []bson.M
	if err = cursor.All(context.TODO(), &results); err != nil {
		log.Fatal(err)
	}

	return results
}

func FindAllActivities(client *mongo.Client) []bson.M {
	coll := client.Database("production").Collection("activities")

	// Define the aggregation pipeline
	pipeline := mongo.Pipeline{
		// Group by name and sum up the duration for each name
		{{Key: "$group", Value: bson.D{
			{Key: "_id", Value: "$name"}, // Group by activity name
			{Key: "total_duration", Value: bson.D{{Key: "$sum", Value: "$duration"}}},
		}}},
		// Sort by total_duration in descending order
		{{Key: "$sort", Value: bson.D{{Key: "total_duration", Value: -1}}}},
	}

	// Execute the aggregation
	cursor, err := coll.Aggregate(context.TODO(), pipeline)
	if err != nil {
		log.Fatal(err)
	}

	var results []bson.M
	if err = cursor.All(context.TODO(), &results); err != nil {
		log.Fatal(err)
	}

	return results
}
