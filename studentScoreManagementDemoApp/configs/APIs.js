import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

export const endpoints = {
  "upload-avatar": (user_id) => `/users/${user_id}/upload-avatar/`,
  teachers: "/teachers/",

  studyclassrooms: "/studyclassrooms/",
  "check-locked-scored-studyclassroom": (studyclassroom_id) =>
    `/studyclassrooms/${studyclassroom_id}/`,
  studyclassroomsofstudent: (student_id) =>
    `/students/${student_id}/studyclassrooms`,

  students: (studyclassroom_id) =>
    `/studyclassrooms/${studyclassroom_id}/students/`,

  scores: (studyclassroom_id) =>
    `/studyclassrooms/${studyclassroom_id}/students/scores/`,
  "get-score-columns": (studyclassroom_id) =>
    `/studyclassrooms/${studyclassroom_id}/scorecollumns`,
  "add-scores": (studyclassroom_id) =>
    `/studyclassrooms/${studyclassroom_id}/students/add-scores/`,
  "update-scores": (studyclassroom_id) =>
    `/studyclassrooms/${studyclassroom_id}/students/update-scores/`,
  "locked-score-of-studyclassroom": (studyclassroom_id) =>
    `/studyclassrooms/${studyclassroom_id}/locked-score-of-studyclassroom/`,
  "export-csv-scores": (studyclassroom_id) =>
    `/studyclassrooms/${studyclassroom_id}/students/export-csv-scores/`,
  "export-pdf-scores": (studyclassroom_id) =>
    `/studyclassrooms/${studyclassroom_id}/students/export-pdf-scores/`,

  "get-topics": (studyclassroom_id) =>
    `/studyclassrooms/${studyclassroom_id}/topics`,

  comments: (topic_id) => `/topics/${topic_id}/comments/`,
  "add-topic": (studyclassroom_id) =>
    `/studyclassrooms/${studyclassroom_id}/add-topic/`,
  "add-comment": (topic_id) => `/topics/${topic_id}/add-comment/`,
  "lock-or-unlock-topic": (topic_id) =>
    `/topics/${topic_id}/lock_or_unlock_topic/`,

  studies: (student_id) => `/students/${student_id}/studies/`,

  login: "/o/token/",
  "current-user": "/users/current-user/",

  register: "/students/",
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
