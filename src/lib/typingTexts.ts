export const typingTexts = [
  "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet at least once. It has been used to test typewriters and computer keyboards since the late nineteenth century.",
  "Programming is the art of telling a computer what to do through a series of instructions. Good code is not just functional but also readable and maintainable by other developers.",
  "Technology continues to shape our daily lives in profound ways. From smartphones to artificial intelligence, innovation drives progress across every industry and touches every corner of society.",
  "The ocean covers more than seventy percent of the Earth's surface. Its depths remain largely unexplored, holding countless mysteries and species yet to be discovered by scientists.",
  "Music has the power to evoke emotions and memories like nothing else. A single melody can transport us back in time or inspire us to dream about the future.",
  "Reading expands our horizons and introduces us to new ideas and perspectives. Books are windows into different worlds, cultures, and ways of thinking about life.",
  "Exercise is essential for maintaining both physical and mental health. Regular activity strengthens the body, sharpens the mind, and improves overall quality of life significantly.",
  "The stars we see at night are actually suns located unimaginably far away. Some of the light reaching our eyes today began its journey thousands of years ago.",
  "Creativity is not limited to artists and musicians. Problem solving in any field requires innovative thinking and the ability to see connections that others might miss.",
  "Coffee has become one of the most popular beverages worldwide. Its rich aroma and energizing effects have made it an essential part of morning routines across cultures.",
];

export const getRandomText = (): string => {
  return typingTexts[Math.floor(Math.random() * typingTexts.length)];
};
