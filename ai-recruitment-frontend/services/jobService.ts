import API from "../lib/api";

export const getJobs = async () => {
  const res = await API.get("/jobs");
  return res.data;
};

export const deleteJob = async (id: number) => {
  const res = await API.delete(`/jobs/${id}`);
  return res.data;
};

export const updateJob = async (id: number, data: any) => {
  const res = await API.put(`/jobs/${id}`, data);
  return res.data;
};