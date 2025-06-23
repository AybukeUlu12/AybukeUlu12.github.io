// Data for various suggestions (recipes, restaurants, etc.)
// In a real application, this data would likely come from an API or database.
const data = {
    // Restaurants for when outside and nearby
    restaurants: [
        { name: "The Urban Spoon", cuisine: "Modern American", notes: "Great for a quick lunch!" },
        { name: "Spice Route Bistro", cuisine: "Indian Fusion", notes: "Known for their curries." },
        { name: "Pasta Palace", cuisine: "Italian", notes: "Cozy atmosphere, delicious pasta." }
    ],
    // Food delivery services for when outside but no restaurant nearby
    deliveryServices: [
        { name: "FoodieDash", slogan: "Delivering your favorites fast." },
        { name: "QuickEats", slogan: "Local and international cuisine at your doorstep." }
    ],
    // Quick recipes (under 15 minutes)
    quickRecipes: [
        { name: "10-Minute Pesto Pasta", dietary: ["none", "vegetarian"], ingredients: "Pasta, Pesto, Cherry Tomatoes, Parmesan" },
        { name: "Speedy Scrambled Eggs with Toast", dietary: ["none", "vegetarian"], ingredients: "Eggs, Bread, Butter, Salt, Pepper" },
        { name: "Tuna Salad Sandwich", dietary: ["none"], ingredients: "Canned Tuna, Mayonnaise, Celery, Bread" },
        { name: "Cucumber & Hummus Bites", dietary: ["none", "vegetarian", "vegan", "gluten-free"], ingredients: "Cucumber, Hummus, Paprika" },
        { name: "Avocado Toast with Everything Bagel Seasoning", dietary: ["none", "vegetarian", "vegan"], ingredients: "Bread, Avocado, Everything Bagel Seasoning" }
    ],
    // Regular recipes
    regularRecipes: [
        { name: "Classic Chicken Stir-fry", dietary: ["none"], ingredients: "Chicken, Mixed Vegetables, Soy Sauce, Rice" },
        { name: "Lentil Soup (Hearty & Healthy)", dietary: ["none", "vegetarian", "vegan", "gluten-free"], ingredients: "Lentils, Carrots, Celery, Onion, Broth, Spices" },
        { name: "Homemade Pizza", dietary: ["none", "vegetarian"], ingredients: "Pizza Dough, Tomato Sauce, Cheese, Toppings" },
        { name: "Baked Salmon with Asparagus", dietary: ["none", "gluten-free"], ingredients: "Salmon fillet, Asparagus, Lemon, Herbs" },
        { name: "Vegetarian Chili", dietary: ["none", "vegetarian", "vegan", "gluten-free"], ingredients: "Beans, Tomatoes, Corn, Bell Peppers, Chili Powder" }
    ],
    // Example shopping list items
    shoppingListItems: [
        "Pasta", "Tomato Sauce", "Onions", "Garlic", "Bell Peppers", "Chicken Breast",
        "Eggs", "Milk", "Bread", "Cheese", "Fresh Vegetables", "Fruit", "Cooking Oil"
    ]
};

// --- Get DOM Elements ---
const outsideRadios = document.querySelectorAll('input[name="outside"]');
const restaurantNearbyRadios = document.querySelectorAll('input[name="restaurantNearby"]');
const ingredientsHomeRadios = document.querySelectorAll('input[name="ingredientsHome"]');
const hurryRadios = document.querySelectorAll('input[name="hurry"]');
const dietPreferenceRadios = document.querySelectorAll('input[name="dietPreference"]');

const restaurantNearbySection = document.getElementById('restaurant-nearby-section');
const ingredientsAtHomeSection = document.getElementById('ingredients-at-home-section');
const getSuggestionBtn = document.getElementById('getSuggestionBtn');
const suggestionOutput = document.getElementById('suggestion-output');
const suggestionContent = document.getElementById('suggestion-content');
const errorMessageDiv = document.getElementById('error-message');

const outsideError = document.getElementById('outside-error');
const restaurantError = document.getElementById('restaurant-error');
const ingredientsError = document.getElementById('ingredients-error');
const hurryError = document.getElementById('hurry-error');


// --- Event Listeners ---

// Listen for changes on the "Are you outside?" radio buttons
outsideRadios.forEach(radio => {
    radio.addEventListener('change', (event) => {
        const isOutside = event.target.value === 'yes';
        // Show/hide conditional sections based on "outside" choice
        if (isOutside) {
            restaurantNearbySection.classList.remove('hidden');
            ingredientsAtHomeSection.classList.add('hidden');
            // Reset ingredients at home radios if switching from "no" to "yes"
            ingredientsHomeRadios.forEach(r => r.checked = false);
            ingredientsError.classList.add('hidden'); // Hide any previous error
        } else {
            restaurantNearbySection.classList.add('hidden');
            ingredientsAtHomeSection.classList.remove('hidden');
            // Reset restaurant nearby radios if switching from "yes" to "no"
            restaurantNearbyRadios.forEach(r => r.checked = false);
            restaurantError.classList.add('hidden'); // Hide any previous error
        }
        // Hide initial error messages if an option is selected
        outsideError.classList.add('hidden');
        suggestionOutput.classList.add('hidden'); // Hide previous suggestion
    });
});

// Hide error messages when other radio buttons are selected
restaurantNearbyRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        restaurantError.classList.add('hidden');
        suggestionOutput.classList.add('hidden');
    });
});

ingredientsHomeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        ingredientsError.classList.add('hidden');
        suggestionOutput.classList.add('hidden');
    });
});

hurryRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        hurryError.classList.add('hidden');
        suggestionOutput.classList.add('hidden');
    });
});

// Main button click handler
getSuggestionBtn.addEventListener('click', () => {
    generateSuggestion();
});


// --- Core Logic Functions ---

/**
 * Gets the selected value from a group of radio buttons.
 * @param {NodeList} radios - The NodeList of radio button elements.
 * @returns {string | null} The value of the selected radio button, or null if none is selected.
 */
function getSelectedRadioValue(radios) {
    for (const radio of radios) {
        if (radio.checked) {
            return radio.value;
        }
    }
    return null;
}

/**
 * Generates and displays the meal suggestion based on user inputs.
 */
function generateSuggestion() {
    // Hide previous error messages and suggestions
    errorMessageDiv.classList.add('hidden');
    suggestionOutput.classList.add('hidden');
    suggestionContent.innerHTML = ''; // Clear previous content

    // Get all user inputs
    const isOutside = getSelectedRadioValue(outsideRadios);
    let hasRestaurantNearby = null;
    let hasIngredientsHome = null;

    // Conditionally get inputs based on "outside" status
    if (isOutside === 'yes') {
        hasRestaurantNearby = getSelectedRadioValue(restaurantNearbyRadios);
    } else if (isOutside === 'no') {
        hasIngredientsHome = getSelectedRadioValue(ingredientsHomeRadios);
    }

    const isInHurry = getSelectedRadioValue(hurryRadios);
    const dietPreference = getSelectedRadioValue(dietPreferenceRadios); // Will default to 'none' if no other is selected

    // --- Input Validation ---
    let allInputsValid = true;

    // Validate 'outside' choice
    if (isOutside === null) {
        outsideError.classList.remove('hidden');
        allInputsValid = false;
    } else {
        outsideError.classList.add('hidden');
    }

    // Validate conditional choices based on 'outside'
    if (isOutside === 'yes' && hasRestaurantNearby === null) {
        restaurantError.classList.remove('hidden');
        allInputsValid = false;
    } else if (isOutside === 'no' && hasIngredientsHome === null) {
        ingredientsError.classList.remove('hidden');
        allInputsValid = false;
    } else {
        restaurantError.classList.add('hidden'); // Ensure these are hidden if not applicable or valid
        ingredientsError.classList.add('hidden');
    }

    // Validate 'hurry' choice
    if (isInHurry === null) {
        hurryError.classList.remove('hidden');
        allInputsValid = false;
    } else {
        hurryError.classList.add('hidden');
    }

    // If any required input is missing, show error and stop
    if (!allInputsValid) {
        errorMessageDiv.classList.remove('hidden');
        return; // Stop function execution
    }

    let suggestion = "";
    let recipeList = [];

    // --- First set of logical statements (Location Context) ---
    if (isOutside === 'yes') { // O = true
        if (hasRestaurantNearby === 'yes') { // O && R
            const restaurant = data.restaurants[Math.floor(Math.random() * data.restaurants.length)];
            suggestion = `<p class="text-xl font-medium text-blue-800">Go to a restaurant!</p>` +
                         `<p>How about <span class="font-bold">${restaurant.name}</span> (${restaurant.cuisine})? ${restaurant.notes}</p>`;
        } else { // O && !R
            const deliveryService = data.deliveryServices[Math.floor(Math.random() * data.deliveryServices.length)];
            suggestion = `<p class="text-xl font-medium text-blue-800">Order some food!</p>` +
                         `<p>Consider using a food delivery service like <span class="font-bold">${deliveryService.name}</span>. ${deliveryService.slogan}</p>`;
        }
    } else { // !O = true (at home)
        if (hasIngredientsHome === 'yes') { // !O && I
            // Will suggest a recipe later based on time/diet
            suggestion = `<p class="text-xl font-medium text-green-800">Time to cook at home!</p>`;
        } else { // !O && !I
            suggestion = `<p class="text-xl font-medium text-green-800">You need to go grocery shopping!</p>` +
                         `<p>Here's a basic shopping list to get you started:</p>` +
                         `<ul class="list-disc list-inside mt-2 space-y-1">` +
                         data.shoppingListItems.map(item => `<li>${item}</li>`).join('') +
                         `</ul>` +
                         `<p class="mt-2">Remember to buy ingredients for a few meals you enjoy!</p>`;
        }
    }

    // --- Second set of logical statements (Time & Diet Preference) ---
    // These only apply if the initial suggestion isn't a shopping list or external dining.
    // They are primarily for filtering recipes.
    if (isOutside === 'no' && hasIngredientsHome === 'yes') {
        // Determine base recipe list based on hurry status
        if (isInHurry === 'yes') { // H = true
            recipeList = data.quickRecipes;
            suggestion += `<p class="mt-4 text-lg text-gray-700">Here's a quick recipe for you (under 15 minutes):</p>`;
        } else { // !H
            recipeList = data.regularRecipes;
            suggestion += `<p class="mt-4 text-lg text-gray-700">Here's a recipe idea for you:</p>`;
        }

        // Filter recipes by dietary preference if applicable
        let filteredRecipes = [];
        if (dietPreference && dietPreference !== 'none') { // D = true
            filteredRecipes = recipeList.filter(recipe => recipe.dietary.includes(dietPreference));
            if (filteredRecipes.length === 0) {
                // Fallback if no specific diet preference recipe found
                suggestion += `<p class="text-orange-600 mt-2">No specific recipes found for "${dietPreference}" in this category. Here's a general suggestion:</p>`;
                filteredRecipes = recipeList; // Use unfiltered list as fallback
            } else {
                suggestion += `<p class="mt-2 text-purple-700">Filtered for your "${dietPreference}" preference:</p>`;
            }
        } else { // !D
            filteredRecipes = recipeList; // Allow free recipe selection
            suggestion += `<p class="mt-2">Enjoy this meal idea:</p>`;
        }

        // Pick a random recipe from the filtered list
        if (filteredRecipes.length > 0) {
            const chosenRecipe = filteredRecipes[Math.floor(Math.random() * filteredRecipes.length)];
            suggestion += `<div class="p-4 bg-purple-100 rounded-lg shadow-md mt-4 border border-purple-300">` +
                          `<h3 class="text-xl font-bold text-purple-900 mb-2">${chosenRecipe.name}</h3>` +
                          `<p><span class="font-semibold">Main Ingredients:</span> ${chosenRecipe.ingredients}</p>` +
                          `<p class="text-sm mt-2 text-gray-600">Consider searching for the full recipe online!</p>` +
                          `</div>`;
        } else {
            // This case should ideally not happen if fallback to unfiltered list is done correctly
            suggestion += `<p class="text-red-500 mt-4">Sorry, I couldn't find a suitable recipe for your criteria.</p>`;
        }
    }

    // Display the suggestion
    suggestionContent.innerHTML = suggestion;
    suggestionOutput.classList.remove('hidden'); // Show the suggestion area

    // Add visual feedback (e.g., subtle animation or focus)
    suggestionOutput.scrollIntoView({ behavior: 'smooth', block: 'start' });
    suggestionOutput.classList.add('animate-pulse-once'); // Define this CSS animation if needed
    setTimeout(() => {
        suggestionOutput.classList.remove('animate-pulse-once');
    }, 1000); // Remove animation class after a short duration
}

// Basic animation for visual feedback (add to your style.css if you prefer)
// Alternatively, include it directly here using a style tag, or assume Tailwind's transitions.
// For this example, let's just make it a subtle pop effect when appearing.
const style = document.createElement('style');
style.innerHTML = `
@keyframes pulse-once {
    0% { transform: scale(0.98); opacity: 0.8; }
    50% { transform: scale(1); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
}
.animate-pulse-once {
    animation: pulse-once 0.5s ease-out;
}
`;
document.head.appendChild(style);
