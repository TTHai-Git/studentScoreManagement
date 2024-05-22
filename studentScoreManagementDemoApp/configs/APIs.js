// const axios = require("axios");

// async function getTeachers(page) {
//   const response = await axios.get(`http://192.168.1.3:8000/teachers/`);
//   return response.data;
// }

// getTeachers().then((data) => {
//   console.log(data);
// });

import axios from "axios";

const BASE_URL = "http://192.168.1.3:8000";

export const endpoints = {
  teachers: "/teachers/",

  studyclassrooms: "/studyclassrooms/",

  students: (studyclassroom_id) => `/studyclassrooms/${studyclassroom_id}/students/`,

  scores: (studyclassroom_id) => `/studyclassrooms/${studyclassroom_id}/students/scores/`,
        "add-scores": (studyclassroom_id) => `/studyclassrooms/${studyclassroom_id}/students/add-scores/`,
        "update-scores": (studyclassroom_id) => `/studyclassrooms/${studyclassroom_id}/students/update-scores/`,
        "locked-score-of-studyclassroom": (studyclassroom_id) => `/studyclassrooms/${studyclassroom_id}/locked-score-of-studyclassroom/`,
        "export-csv-scores": (studyclassroom_id) => `/studyclassrooms/${studyclassroom_id}/students/export-csv-scores/`,
        "export-pdf-scores": (studyclassroom_id) => `/studyclassrooms/${studyclassroom_id}/students/export-pdf-scores/`,

  topics: "/topics/",
  comments: (topic_id) => `/topics/${topic_id}/comments/`,
        "add-topic": (studyclassroom_id) => `/studyclassrooms/${studyclassroom_id}/`,
        "add-commnet": (topic_id) => `/topics/${topic_id}/add-comment/`,
        "lock-or-unlock-topic": (topic_id) => `/topics/${topic_id}/comments/`,

  studies: (student_id) => `/students/${student_id}/studies/`,

  login: "/o/token/",
        "current-user": "/users/current-user/",
    
  register: "/students/",
};

export const authApi = (accessToken) =>
  axios.create({
    headers: {
      Authorization: `bearer ${accessToken}`,
    },
});

export default axios.create({
  baseUrl: BASE_URL,
});