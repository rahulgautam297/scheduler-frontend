import APIConfig from '../../API/APIConfig';
import APIService from '../../API/APIService';

class SchedulerService {
  constructor() {
    this.apiService = new APIService();
  }

  getAllTodaysTasks(payload, onResponse, onError) {
    let url = APIConfig.scheduler.getAllTodaysTasks;
    return this.apiService.post(url, payload, onResponse, onError);
  }

  getPreviousTasks(onResponse, onError) {
    let url = APIConfig.scheduler.getPreviousTasks;
    return this.apiService.get(url, onResponse, onError);
  }

  saveTask(payload, onResponse, onError) {
    let url = APIConfig.scheduler.saveTask;
    return this.apiService.post(url, payload, onResponse, onError);
  }

  updateTask(id, payload, onResponse, onError) {
    let url = APIConfig.scheduler.updateTask + `?taskId=${id}`;
    return this.apiService.put(url, payload, onResponse, onError);
  }

}

export default SchedulerService;