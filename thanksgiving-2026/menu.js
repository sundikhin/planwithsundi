// The Thanksgiving 2026 menu. Edit this file to change dishes, who's making them,
// the prep plan, or the shopping list. The whole page is built from it.
//
// Dish fields:
//   who:          a key from COOKS below, or null if nobody has claimed it yet.
//   request:      optional — whose request the dish is, shown as a little star tag.
//   bringing:     true if the person is bringing it already made.
//   addon:        true for toppings/extras shown as a dashed row under a course.
//   feature:      true to show the dish as the big card.
//   note:         optional short line shown under the name.
//   tasks:        game plan tickets — { day, text } (day is a key from DAYS).
//                 A task is assigned to the dish's cook unless it sets its own `who`
//                 (null = nobody yet). `title` overrides the ticket heading.
//   ingredients:  shopping list lines — { item, amount, aisle } (aisle is a key from AISLES).
//                 Same item across dishes gets combined into one line. Also shown in the
//                 recipe panel when you tap the dish.
//   recipe:       list of steps shown in the recipe panel. Leave it out and the panel
//                 says "Incoming".
//   meta:         optional line under the dish name in the panel (serves, pan size).
//   source:       optional { label, url } — link to the original recipe, shown in the panel.
//   maybe:        true if it's not decided yet. The cook's tag gets a dotted outline, and the
//                 dish is left out of the dish counts (it shows as "N maybe" instead).
//   prep:         optional cook key for someone who buys + preps a dish that another cook
//                 (e.g. a caterer) finishes. Their tag shows as "· preps" next to the main one.
//   shop:         false to keep this dish's ingredients off the shopping list
//                 (e.g. someone else is making it and buying their own groceries).

window.COOKS = {
  sundi:    { name: "Sundi",    tone: "rust" },
  mom:      { name: "Mom",      tone: "olive" },
  wynn:     { name: "Wynn",     tone: "gold" },
  pwapwa:   { name: "Pwa Pwa",  tone: "plum" },
  michael:  { name: "Michael",  tone: "slate" },
  matthews: { name: "Matthews Smokin' BBQ", catered: true },
};

window.DAYS = [
  { key: "mon", label: "Mon", sub: "plan + shop", date: "2026-11-23" },
  { key: "tue", label: "Tues", sub: "prep",       date: "2026-11-24" },
  { key: "wed", label: "Wed",  sub: "make ahead", date: "2026-11-25" },
  { key: "thu", label: "Thurs", sub: "fire",      date: "2026-11-26" },
];

window.AISLES = [
  { key: "produce", label: "Produce" },
  { key: "meat",    label: "Meat" },
  { key: "dairy",   label: "Dairy" },
  { key: "bakery",  label: "Bakery" },
  { key: "pantry",  label: "Pantry" },
];

// Tickets that aren't tied to one dish.
window.EXTRA_TASKS = [
  { day: "mon", title: "Grocery run", text: "everything on the shopping list", who: "sundi" },
];

window.MENU = [
  { course: "Appetizer", dishes: [
    { name: "Smoked salmon crostini", who: "pwapwa", request: "Pwa Pwa", bringing: true, shop: false,
      ingredients: [
        { item: "Smoked salmon",               aisle: "meat" },
        { item: "Whipped cream cheese",        aisle: "dairy" },
        { item: "Mini toasts or crackers",     aisle: "bakery" },
        { item: "Fresh dill",                  aisle: "produce" },
      ],
      recipe: [
        "Add a small dollop of whipped cream cheese to each toast or cracker.",
        "Top with a small piece of smoked salmon, then a sprig of dill.",
        "Arrange on a platter and serve.",
      ] },
  ]},
  { course: "Main", dishes: [
    { name: "Smoked turkey", who: "matthews", prep: "sundi", feature: true,
      meta: "Sundi buys + seasons · Matthews smokes Thursday · ~2 hrs at 225°",
      source: { label: "The Big Man's World — Smoked Turkey Wings", url: "https://thebigmansworld.com/smoked-turkey-wings/" },
      ingredients: [
        { item: "Turkey wings, separated", amount: "4 lb",   aisle: "meat" },
        { item: "Olive oil",               amount: "2 tbsp", aisle: "pantry" },
        { item: "Brown sugar",             amount: "2 tsp",  aisle: "pantry" },
        { item: "Chili powder",            amount: "1 tsp",  aisle: "pantry" },
        { item: "Smoked paprika",          amount: "1 tsp",  aisle: "pantry" },
        { item: "Onion powder",            amount: "1 tsp",  aisle: "pantry" },
        { item: "Garlic powder",           amount: "½ tsp",  aisle: "pantry" },
        { item: "Kosher salt",             amount: "½ tsp",  aisle: "pantry" },
        { item: "Black pepper",            amount: "½ tsp",  aisle: "pantry" },
      ],
      recipe: [
        "Your part — If the wings are frozen, thaw them in the fridge (start by Tuesday).",
        "Your part — Mix the brown sugar and all the spices into a rub.",
        "Your part — Thursday morning: pat the wings dry, brush with olive oil, and coat all over with the rub.",
        "Matthews' part — Smoke at 225° with any hardwood for about 2 hours, until 165° inside.",
        "Optional — For crispier skin, finish in a 350° oven for 15 min. Let them cool slightly before serving.",
        "Leftovers keep 4 days in the fridge; reheat covered in the oven or air fryer, not the microwave.",
      ],
      tasks: [
        { day: "mon", title: "Turkey wings", text: "buy 4 lb; thaw in fridge if frozen", who: "sundi" },
        { day: "wed", title: "Turkey wings", text: "mix the rub", who: "sundi" },
        { day: "thu", title: "Turkey wings", text: "AM: pat dry, oil, rub; hand off to Matthews", who: "sundi" },
        { day: "thu", title: "Matthews order", text: "pick up smoked turkey, cornbread, pies", who: "michael" },
      ] },
  ]},
  { course: "Sides", dishes: [
    { name: "Creamy mashed potatoes", who: "sundi",
      tasks: [
        { day: "wed", text: "peel + cube, hold in cold water" },
        { day: "thu", text: "boil, mash, keep warm" },
      ],
      ingredients: [
        { item: "Yukon gold potatoes", amount: "5 lb",    aisle: "produce" },
        { item: "Butter",              amount: "1 stick", aisle: "dairy" },
        { item: "Heavy cream",         amount: "1 cup",   aisle: "dairy" },
        { item: "Kosher salt",                            aisle: "pantry" },
      ],
      recipe: [
        "Peel and cut the potatoes into 2-inch chunks. Hold in a pot of cold, salted water (fine overnight in the fridge).",
        "Bring to a boil, then simmer 15–20 min until a fork slides in easily.",
        "Drain and let them steam-dry in the pot for a couple of minutes.",
        "Warm the butter and cream together.",
        "Mash or rice the potatoes, fold in the butter and cream, salt to taste.",
        "Keep warm, covered, over very low heat or in a slow cooker until lunch.",
      ] },
    { name: "Stuffing a la Roman", who: "sundi",
      meta: "Serves 6–8 · 2½–3 qt baking dish or 9×13",
      source: { label: "Alison Roman — Classic Celery Stuffing", url: "https://www.alisoneroman.com/newsletters/stuffing-video/" },
      tasks: [
        { day: "tue", text: "tear bread, leave out to dry" },
        { day: "wed", text: "slice onions + garlic, chop celery + herbs; bag and chill" },
        { day: "thu", text: "cook veg, mix, first bake covered (375°)" },
        { day: "thu", text: "uncover, crisp at 425° right before lunch" },
      ],
      ingredients: [
        { item: "Crusty bread (sourdough or ciabatta)", amount: "1¼ lb",    aisle: "bakery" },
        { item: "Olive oil",                            amount: "½ cup",    aisle: "pantry" },
        { item: "Butter",                               amount: "1 stick",  aisle: "dairy" },
        { item: "Garlic",                               amount: "8 cloves", aisle: "produce" },
        { item: "Yellow onion",                         amount: "2",        aisle: "produce" },
        { item: "Celery",                               amount: "4 cups",   aisle: "produce" },
        { item: "Dry white wine",                       amount: "1 cup",    aisle: "pantry" },
        { item: "Chicken stock",                        amount: "2½ cups",  aisle: "pantry" },
        { item: "Eggs",                                 amount: "3",        aisle: "dairy" },
        { item: "Parsley (or celery leaves)",           amount: "1 cup",    aisle: "produce" },
        { item: "Chives",                               amount: "½ cup",    aisle: "produce" },
        { item: "Marjoram, oregano, or thyme (optional)", amount: "2 tbsp", aisle: "produce" },
        { item: "Kosher salt",                                              aisle: "pantry" },
        { item: "Black pepper",                                             aisle: "pantry" },
      ],
      recipe: [
        "Tear the bread into big 1½–2 inch pieces and leave it out on a sheet pan for 12–24 hours to dry (or dry it in a 300° oven without browning).",
        "Oven to 375°. Melt the butter into the olive oil and cook the sliced garlic and onions, seasoned, until very soft — about 10–12 min.",
        "Add the celery, season, and cook until bright and tender, 4–6 min. Pour in the wine and let it cook down by about half.",
        "Whisk the stock and eggs, pour over the bread, and keep tossing until it's all soaked up.",
        "Gently fold in the vegetables and herbs, then pile loosely into the dish — don't pack it down.",
        "Bake covered with foil for 40–45 min. It can wait here for a few hours if needed.",
        "Uncover, crank to 425°, and bake 20–25 min more until crisp and deep golden. Top with celery leaves.",
      ] },
    { name: "Turkey gravy", who: "sundi",
      meta: "Drippings come from wings roasted Monday · make ahead Wednesday",
      tasks: [
        { day: "mon", text: "roast wings just for pan drippings; chill drippings" },
        { day: "wed", text: "roux, then drippings + wine + stock" },
        { day: "thu", text: "reheat, thin with stock if needed" },
      ],
      ingredients: [
        { item: "Turkey wings, for drippings", amount: "2–3 lb", aisle: "meat" },
        { item: "Olive oil",       amount: "1 tbsp",  aisle: "pantry" },
        { item: "Butter",          amount: "½ stick", aisle: "dairy" },
        { item: "Flour",           amount: "¼ cup",   aisle: "pantry" },
        { item: "Dry white wine",  amount: "½ cup",   aisle: "pantry" },
        { item: "Chicken stock",   amount: "1 qt, as needed", aisle: "pantry" },
        { item: "Kosher salt",                        aisle: "pantry" },
        { item: "Black pepper",                       aisle: "pantry" },
      ],
      recipe: [
        "Monday — oven to 425°. Pat the wings dry, rub with oil, salt, and pepper, and roast in a pan about 1 hr until deep golden.",
        "Monday — pour the pan drippings into a jar. Splash a little stock or water into the hot pan and scrape up the browned bits, then add that to the jar too. Chill overnight; the fat rises and sets on top. The wings themselves are a cook's snack.",
        "Wednesday — melt the butter (or some of the skimmed turkey fat) in a saucepan, whisk in the flour, and cook 3–4 min until it smells toasty and turns light golden.",
        "Whisk in the wine and let it bubble a minute. Whisk in the drippings, then add stock a little at a time until it's the thickness you like. Simmer about 10 min, then salt and pepper to taste.",
        "Cool and refrigerate.",
        "Thursday — reheat gently, whisking. Thin with a splash of stock if it's too thick.",
      ] },
    { name: "Citrusy cranberry sauce", who: "mom", shop: false,
      meta: "Serves 6–8 · make up to 5 days ahead",
      source: { label: "Alison Roman — The Cranberries", url: "https://www.alisoneroman.com/recipes/the-cranberries/" },
      ingredients: [
        { item: "Cranberries, fresh or frozen", amount: "12–16 oz", aisle: "produce" },
        { item: "Sugar and/or honey",           amount: "¾ cup",    aisle: "pantry" },
        { item: "Citrus juice (tangerine, orange, grapefruit, lemon, or lime)", amount: "2–4 tbsp", aisle: "produce" },
        { item: "Kosher salt",                                      aisle: "pantry" },
        { item: "Black pepper",                                     aisle: "pantry" },
      ],
      recipe: [
        "In a medium pot, combine half the cranberries with the sugar/honey, citrus juice, and a splash of water.",
        "Bring to a boil, drop to medium, and cook 3–5 min, stirring now and then, until the berries start breaking down and look jammy.",
        "Add the rest of the cranberries and cook another 3–5 min until they've all burst.",
        "Off the heat, add a tiny pinch of salt and a crack of pepper. Move to a container and chill completely — it's even better made the night before.",
      ] },
    { name: "Roasted asparagus",       who: "wynn", shop: false,
      ingredients: [
        { item: "Asparagus",    amount: "3 bunches", aisle: "produce" },
        { item: "Garlic",       amount: "a few cloves", aisle: "produce" },
        { item: "Olive oil",    amount: "a drizzle", aisle: "pantry" },
        { item: "Salt",         amount: "to taste",  aisle: "pantry" },
        { item: "Black pepper", amount: "to taste",  aisle: "pantry" },
      ],
      recipe: [
        "Oven to 350°. Snap the woody ends off the asparagus.",
        "Spread the spears on a sheet pan, drizzle olive oil on top, scatter the garlic cloves around, and season with salt and pepper.",
        "Roast about 25 min.",
      ] },
    { name: "Southern-style collard greens", who: "wynn",
      tasks: [
        { day: "wed", text: "wash + chop the collards" },
      ],
      ingredients: [
        { item: "Collard greens",     aisle: "produce" },
        { item: "Smoked ham hock",    aisle: "meat" },
        { item: "Onion",              aisle: "produce" },
        { item: "Garlic",             aisle: "produce" },
        { item: "Dry white wine",     aisle: "pantry" },
        { item: "Chicken broth",      aisle: "pantry" },
        { item: "Red pepper flakes",  aisle: "pantry" },
        { item: "Kosher salt",  amount: "to taste", aisle: "pantry" },
        { item: "Black pepper", amount: "to taste", aisle: "pantry" },
      ],
      recipe: [
        "Wash the collards well and chop them.",
        "Put the ham hock in a big pot with the onions, garlic, and red pepper flakes to start.",
        "Pour in the white wine and let it simmer down in the pan.",
        "Add the broth, then add the collards a handful at a time, letting each batch wilt down before adding more.",
        "Season with salt and pepper to taste.",
      ] },
    { name: "Roasted beets",           who: "mom", shop: false,
      ingredients: [
        { item: "Beets",        amount: "4 lb",      aisle: "produce" },
        { item: "Olive oil",    amount: "a drizzle", aisle: "pantry" },
        { item: "Kosher salt",  amount: "to taste",  aisle: "pantry" },
        { item: "Black pepper", amount: "to taste",  aisle: "pantry" },
      ],
      recipe: [
        "Oven to 400°. Peel the beets and cut them into quarters.",
        "Toss with olive oil, salt, and pepper.",
        "Roast 30–45 min, until tender.",
      ] },
    { name: "Peppered squash gratin", who: "sundi", maybe: true,
      meta: "Serves 6–8 · 1½–2 qt baking dish",
      source: { label: "Alison Roman — Peppered Squash Gratin", url: "https://www.alisoneroman.com/recipes/peppered-squash-gratin/" },
      tasks: [
        { day: "thu", text: "layer squash, parm, garlic, herbs (a few hrs ahead)" },
        { day: "thu", text: "cream on top, bake covered then uncovered at 425°" },
      ],
      ingredients: [
        { item: "Squash (butternut, acorn, or kabocha)", amount: "5 lb",     aisle: "produce" },
        { item: "Garlic",                                amount: "8 cloves", aisle: "produce" },
        { item: "Fresh sage (or thyme, rosemary, oregano)", amount: "4–6 sprigs", aisle: "produce" },
        { item: "Parmesan",                              amount: "4 oz",     aisle: "dairy" },
        { item: "Heavy cream",                           amount: "1 cup",    aisle: "dairy" },
        { item: "Butter",                                amount: "2 tbsp",   aisle: "dairy" },
        { item: "Olive oil",                             amount: "a drizzle", aisle: "pantry" },
        { item: "Red pepper flakes (optional)",                              aisle: "pantry" },
        { item: "Kosher salt",                                               aisle: "pantry" },
        { item: "Black pepper",                          amount: "lots",     aisle: "pantry" },
      ],
      recipe: [
        "Oven to 425°. Peel, seed, and slice the squash about ¼ inch thick.",
        "Layer the squash in the dish with parmesan, garlic, and herb leaves, seasoning every layer with salt, plenty of black pepper, and chili flakes if you like.",
        "Pour the cream over. Top with more parm, pepper, and a few herbs, then dot with butter or drizzle with olive oil.",
        "Cover with foil and bake 30–35 min, until the squash is fully tender.",
        "Uncover and bake another 30–35 min, until browned on top and the cream has thickened and caramelized at the edges. Let it cool a bit before serving.",
        "Make ahead: layer it (step 2) a few hours early, or bake it completely and reheat at 425°.",
      ] },
    { name: "Honey cornbread", who: "matthews" },
  ]},
  { course: "Desserts", dishes: [
    { name: "Apple pie",   who: "matthews" },
    { name: "Pumpkin pie", who: "matthews" },
    { name: "Vanilla bean whipped cream", who: "wynn", addon: true, note: "for both pies",
      tasks: [ { day: "thu", text: "whip right before dessert" } ],
      ingredients: [
        { item: "Heavy cream",     amount: "1 pt", aisle: "dairy" },
        { item: "Vanilla bean",    amount: "1",    aisle: "pantry" },
        { item: "Powdered sugar",  amount: "3 tbsp", aisle: "pantry" },
      ],
      recipe: [
        "Chill the bowl and whisk in the freezer for 10 min.",
        "Split the vanilla bean lengthwise and scrape out the seeds.",
        "Whip the cream, vanilla seeds, and powdered sugar to soft peaks. Don't walk away — it goes from soft to butter fast.",
      ] },
  ]},
];

// Thursday oven schedule. Times are minutes before (-) or after (+) the meal, so changing
// the lunch time on the page shifts everything. Assumes one oven with two racks.
//   at / until: start and end, in minutes from the meal (leave out `until` for a one-moment step).
//   temp:       set the oven to this — shown as a temperature change row.
//   dish:       name of a dish in MENU (pulls in who's making it + "maybe").
//   text:       what to do.  optional: true for nice-to-haves.  title: overrides the heading.
window.OVEN = {
  dinner: "13:00", // it's really lunch
  steps: [
    { at: -225, temp: 375, text: "Preheat" },
    { at: -210, until: -165, dish: "Stuffing a la Roman", text: "First bake, covered with foil, 40–45 min. Then it rests on the counter, still covered." },
    { at: -165, temp: 425, text: "Crank it up" },
    { at: -150, until: -80, dish: "Peppered squash gratin", text: "Covered 30–35 min, then uncovered 30–35 min until browned. Rest under loose foil." },
    { at: -80, temp: 350, text: "Drop the heat — crack the door for a minute to help" },
    { at: -60, until: -35, dish: "Roasted asparagus", text: "Roast 25 min with the garlic." },
    { at: -50, until: -35, dish: "Smoked turkey", optional: true, text: "Crisp the skin, 15 min, on the other rack." },
    { at: -45, until: -35, dish: "Honey cornbread", optional: true, text: "Warm through, wrapped in foil, 10 min." },
    { at: -35, temp: 425, text: "Back up for the stuffing" },
    { at: -25, until: 0, dish: "Stuffing a la Roman", text: "Uncover and crisp 20–25 min until deep golden. Slide the gratin in for the last 10 min to rewarm." },
    { at: 0, temp: 0, text: "Oven off" },
    { at: 0, until: 45, dish: "Apple pie", title: "Apple + pumpkin pie", optional: true, text: "Pies go into the cooling oven, door shut, to warm while you eat." },
  ],
};
