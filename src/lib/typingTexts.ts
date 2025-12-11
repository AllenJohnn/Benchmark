export const typingTexts = [
  "The morning sun filtered softly through the curtains, casting long stripes of gold across the wooden floor. Birds chattered outside as if debating who would take the first flight of the day. The air was cool, carrying the faint scent of rain from the night before. It was the kind of morning that made everything feel a little slower, a little gentler, as though the world itself had paused to take a breath.",
  
  "Rivers have shaped civilizations for thousands of years, guiding trade routes, feeding crops, and offering places for people to gather. Along their winding paths, towns emerged, stories unfolded, and entire cultures were built. Even today, a quiet walk by a river can feel like touching a thread of history, connecting the present moment to countless lives that flowed before it.",
  
  "The library was silent except for the soft hum of an old ceiling fan and the occasional rustle of pages turning. Rows of books stretched out like corridors of forgotten worlds, waiting for someone curious enough to bring them back to life. A single beam of light fell across a dusty table, illuminating a book left open as if the reader had stepped away only for a moment.",
  
  "Travelers who explore mountain trails often describe a strange mixture of exhaustion and excitement. Every steep climb tests their strength, yet each new ridge reveals a view more breathtaking than the last. The air grows thinner, the wind sharper, and the landscape wider, reminding them how small humans are compared to the vastness of the world.",
  
  "Rainy evenings tend to blur time in a comforting way. The steady rhythm of droplets tapping against windows makes even busy streets feel calmer. People walk a little slower, lights reflect softly on wet pavement, and conversations drift into quieter tones. It is a moment when the world seems to fold into itself, offering a brief pause from the usual rush.",
  
  "Old photographs carry a certain charm, capturing moments that once felt ordinary but now seem precious. The colors may fade and the edges may curl, yet the memories held within remain vivid. A smile frozen in time, a place that no longer exists, or a person long gone can suddenly come alive again with a simple glance.",
  
  "The marketplace buzzed with life as vendors called out their prices and customers negotiated with animated gestures. Aromas of fresh bread, ripe fruit, and warm spices filled the air, mixing into a scent that belonged uniquely to that place. Each stall held its own little world, full of stories waiting to be overheard.",
  
  "As the train rumbled along the tracks, its rhythmic clatter created a steady soundtrack that soothed the passengers. Fields and forests blurred past the windows, painting shifting landscapes of green and gold. Inside, people read, slept, or gazed quietly outside, each lost in their own thoughts as the journey carried them forward.",
  
  "Winter nights have a quiet beauty that often goes unnoticed. Snow muffles the usual sounds of the city, turning everything soft and still. Streetlights glow like small beacons, illuminating drifting flakes that spiral gently through the cold air. Even the simplest walk can feel like stepping into a scene from a storybook.",
  
  "In small coastal towns, life moves at a different pace. Waves crash against the shore in a rhythm older than memory, and seabirds circle lazily overhead. Fishermen mend their nets by the docks, greeting each passerby with familiar warmth. The scent of saltwater lingers in the air, reminding everyone that the sea is both a provider and a mystery.",
];


export const getRandomText = (): string => {
  return typingTexts[Math.floor(Math.random() * typingTexts.length)];
};
