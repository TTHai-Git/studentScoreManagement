import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

export const endpoints = {
  login: "/o/token/",
  "current-user": "/users/current-user/",

  register: "/users/",
  register_teacher: "/teachers/",
  register_student: "/students/",
  "send-otp": "/users/send-otp/",
  "change-password": "/users/change-password/",

  "list-semester": "/semesters/list/",
  roles: "/roles/",
  years: "/semesters/years",

  studyclassroomsofteacher: (teacher_id) =>
    `/teachers/${teacher_id}/studyclassrooms`,
  "check-locked-scored-studyclassroom": (studyclassroom_id) =>
    `/studyclassrooms/${studyclassroom_id}/`,
  studyclassroomsofstudent: (student_id) =>
    `/students/${student_id}/studyclassrooms`,

  "get-schedule": "studyclassrooms/get-schedule",
  "new-schedule": (studyclassroom_id) =>
    `/studyclassrooms/${studyclassroom_id}/new-schedule/`,
  "del-schedule": (schedule_id) => `/schedules/${schedule_id}/delete-schedule/`,
  "update-schedule": (schedule_id) =>
    `/schedules/${schedule_id}/update-schedule/`,

  "list-studyclassrooms-for-register": (student_id) =>
    `/students/${student_id}/list-studyclassrooms-for-register/`,

  "register-study": (studyclassroom_id) =>
    `/studyclassrooms/${studyclassroom_id}/register/`,
  // "member-of-chatroom": (studyclassroom_id) =>
  //   `/studyclassrooms/${studyclassroom_id}/chat-room/`,

  students: (studyclassroom_id) =>
    `/studyclassrooms/${studyclassroom_id}/students/`,

  scores: (studyclassroom_id) =>
    `/studyclassrooms/${studyclassroom_id}/students/scores/`,
  "save-scores": (studyclassroom_id) =>
    `/studyclassrooms/${studyclassroom_id}/save-scores/`,
  lock_or_unlock_scores_of_studyclassroom: (studyclassroom_id) =>
    `/studyclassrooms/${studyclassroom_id}/lock-or-unlock-scores-of-studyclassroom/`,
  "export-csv-scores": (studyclassroom_id) =>
    `/studyclassrooms/${studyclassroom_id}/students/export-csv-scores/`,
  "export-pdf-scores": (studyclassroom_id) =>
    `/studyclassrooms/${studyclassroom_id}/students/export-pdf-scores/`,

  "get-topics": (studyclassroom_id) =>
    `/studyclassrooms/${studyclassroom_id}/topics`,

  comments: (topic_id) => `/topics/${topic_id}/comments/`,
  commentfiles: "/commentfiles/",
  "add-topic": (studyclassroom_id) =>
    `/studyclassrooms/${studyclassroom_id}/add-topic/`,
  "add-comment": (topic_id) => `/topics/${topic_id}/add-comment/`,
  "lock-or-unlock-topic": (topic_id) =>
    `/topics/${topic_id}/lock_or_unlock_topic/`,
  "del-comment": (comment_id) => `/comments/${comment_id}/del-comment/`,
  "del-topic": (topic_id) => `/topics/${topic_id}/del-topic/`,

  studies: (student_id) => `/students/${student_id}/studies/`,
  "evaluate-learning-results": (student_id) =>
    `/students/${student_id}/evaluate-learning-results`,

  "list-registered": (student_id) => `/students/${student_id}/list-registered`,
  "del-registered": (study_id) => `/studies/${study_id}/del-registered/`,
};

export const authApi = (accessToken) =>
  axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

export default axios.create({
  baseURL: BASE_URL,
  headers: {
    "content-type": "application/json",
  },
  timeout: 0,
  withCredentials: false,
});
