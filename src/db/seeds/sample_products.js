// This file would be run manually to populate the database with sample data
// For now, students can use the UI to add products, but this shows the structure

const sampleProducts = [
    {
        name: "Tropical Paradise",
        description: "A beautiful tropical product with vibrant colors",
        category: "tropical",
        tags: ["colorful", "vibrant", "popular"],
        user_rating: 4.5,
        rating_count: 12
    },
    {
        name: "Freshwater Classic",
        description: "A classic freshwater product perfect for beginners",
        category: "freshwater",
        tags: ["beginner", "classic", "easy"],
        user_rating: 4.2,
        rating_count: 8
    },
    {
        name: "Saltwater Specialist",
        description: "An advanced saltwater product for experienced users",
        category: "saltwater",
        tags: ["advanced", "specialist", "marine"],
        user_rating: 4.8,
        rating_count: 15
    },
    {
        name: "Exotic Rare",
        description: "A rare and exotic product with unique characteristics",
        category: "exotic",
        tags: ["rare", "unique", "special"],
        user_rating: 4.9,
        rating_count: 3
    },
    {
        name: "Community Favorite",
        description: "A well-loved product that gets along with others",
        category: "freshwater",
        tags: ["community", "peaceful", "social"],
        user_rating: 4.3,
        rating_count: 20
    }
];

// This would be used to seed the database
console.log('Sample products for manual insertion:', JSON.stringify(sampleProducts, null, 2));