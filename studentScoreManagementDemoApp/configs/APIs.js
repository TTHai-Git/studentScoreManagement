import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

export const endpoints = {
  login: "/o/token/",
  "current-user": "/users/current-user/",

  register: "/users/",
  "send-otp": "/users/send-otp/",
  "change-password": "/users/change-password/",

  studyclassrooms: "/studyclassrooms/",
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
  "locked-score-of-studyclassroom": (studyclassroom_id) =>
    `/studyclassrooms/${studyclassroom_id}/locked-score-of-studyclassroom/`,
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

  studies: (student_id) => `/students/${student_id}/studies/`,
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
