export async function loadMyQuiz() {return {};}
export async function recordQuizAction() {if(sessionStorage.getItem('fail-answer')) throw new Error('Offline');}
export async function resetLessonQuiz() {}
