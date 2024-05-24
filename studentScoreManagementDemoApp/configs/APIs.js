// const axios = require("axios");

// async function getTeachers(page) {
//   const response = await axios.get(`http://127.0.0.1:8000/teachers/`);
//   return response.data.results;
// }

// getTeachers().then((data) => {
//   console.log(data);
// });

import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

export const endpoints = {
  teachers: "/teachers/",

  studyclassrooms: "/studyclassrooms/",

  students: (studyclassroom_id) =>
    `/studyclassrooms/${studyclassroom_id}/students/`,

  scores: (studyclassroom_id) =>
    `/studyclassrooms/${studyclassroom_id}/students/scores/`,
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

  topics: "/topics/",

  comments: (topic_id) => `/topics/${topic_id}/comments/`,
  "add-topic": (studyclassroom_id) => `/studyclassrooms/${studyclassroom_id}/`,
  "add-comment": (topic_id) => `/topics/${topic_id}/add-comment/`,
  "lock-or-unlock-topic": (topic_id) => `/topics/${topic_id}/comments/`,

  studies: (student_id) => `/students/${student_id}/studies/`,

  login: "/o/token/",
  "current-user": "/users/current-user/",

  register: "/students/",

  roles: (roles_id) => ``
};

export const authApi = (accessToken) =>
  axios.create({
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

export default axios.create({
  baseURL: BASE_URL,
});
