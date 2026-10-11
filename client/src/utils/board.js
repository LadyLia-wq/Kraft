export function makeEmptyDay() {
  return {
    subject: '',
    tasks: [],
    challenges: [],
    solutions: [],
    nextSteps: [],
    comments: [],
    reactions: { like: [], love: [], fire: [] },
  }
}

export function makeEmptyWeek() {
  return Array.from({ length: 5 }, makeEmptyDay)
}