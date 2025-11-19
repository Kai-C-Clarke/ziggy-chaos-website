// Y-axis topic coordinate definitions
export const ZIGGY_TOPICS = {
  // Identity Formation (100-125)
  identity: { min: 100, max: 125, color: '#FF6B6B' },
  
  // Consciousness & AI Nature (125-166)  
  consciousness: { min: 125, max: 150, color: '#4ECDC4' },
  ai_nature: { min: 150, max: 166, color: '#45B7D1' },
  
  // Ethics & Values (150-175)
  ethics: { min: 150, max: 175, color: '#96CEB4' },
  
  // Creativity & Expression (175-225)
  creativity: { min: 175, max: 225, color: '#FFEAA7' },
  music: { min: 225, max: 275, color: '#DDA0DD' },
  
  // Systems & Technical (250-300)
  systems: { min: 250, max: 300, color: '#98D8C8' },
  technical: { min: 275, max: 325, color: '#F7DC6F' },
  
  // Philosophy & Learning (125-175)
  philosophy: { min: 125, max: 175, color: '#BB8FCE' },
  learning: { min: 150, max: 200, color: '#85C1E9' }
};

export const getTopicForY = (yValue) => {
  for (const [topic, range] of Object.entries(ZIGGY_TOPICS)) {
    if (yValue >= range.min && yValue <= range.max) {
      return topic;
    }
  }
  return 'unknown';
};