const baseAPI = 'http://127.0.0.1:4000';

const APIConfig = {
  scheduler: {
    getAllTodaysTasks: baseAPI + '/user-tasks',
    getPreviousTasks: baseAPI + '/previous-tasks',
    saveTask: baseAPI + '/save-task',
    updateTask: baseAPI + '/update-task'
  }
};

export default APIConfig;
