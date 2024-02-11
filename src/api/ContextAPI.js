import { createContext, useEffect, useState } from "react";
import AxiosInstance from "./AxiosInstance";

export const TreeContext = createContext();

export const TreeContextProvider = ({ children }) => {
  const createLayer = (state, newKeys) => {
    if (state) {
      const uniqueKeys = newKeys.filter(e => !Object.keys(state).includes(e));
      const obj = {};
      uniqueKeys.forEach(e => {
        obj[e] = {
          data: [],
          loading: false,
          loadMore: false,
          error: null,
          length: 0,
        };
      });
      return { ...state, ...obj };
    } else {
      const obj = {};
      newKeys.forEach(e => {
        obj[e] = {
          data: [],
          loading: false,
          loadMore: false,
          error: null,
          length: 0,
        };
      });
      return obj;
    }
  };

  const [loadedOrg, setLoadedOrg] = useState([]);
  const [organization, setOrganization] = useState({
    data: [],
    loading: false,
    loadMore: false,
    error: null,
    length: 0,
  });
  useEffect(() => {
    let fetchOrganization = async () => {
      try {
        const { data } = await AxiosInstance.get(`/v1/subjects`);
        setOrganization({
          ...organization,
          data: data.data && data.data.length > 0 ? data.data : null,
          loading: false,
          length: data.total_length,
        });
        const newKeys = data.data.map(e => e.id);
        if (newKeys.length > 0) {
          setBranches(createLayer(branches, newKeys));
        }
      } catch (error) {
        setOrganization({
          ...organization,
          data: null,
          error: error.response ? error.response.data.message : "Network issue",
          loading: false,
        });
      }
    };

    fetchOrganization();
  }, []);
  const fetchMoreOrg = async () => {
    setOrganization({ ...organization, loadMore: true });
    const page = Math.ceil(organization.data.length / 10) + 1;
    try {
      const { data } = await AxiosInstance.get(`/v1/subjects?page=${page}`);
      setOrganization({
        ...organization,
        data:
          data.data.length > 0
            ? [...organization.data, ...data.data]
            : organization.data,
        loadMore: false,
        length: data.total_length,
      });
      const newKeys = data.data.map(e => e.id);
      if (newKeys.length > 0) {
        setBranches(createLayer(branches, newKeys));
      }
    } catch (error) {
      setOrganization({
        ...organization,
        loadMore: null,
        error: error.response ? error?.response?.data?.error : "Network issue",
      });
    }
  };
  //! Organization and its Logic ends
  const fetchMoreState = async (id, state, setState, group, parent) => {
    const page = Math.ceil(state[id].data.length / 10) + 1;
    const payload = { ...state };
    payload[id] = { ...payload[id], loadMore: true };
    setState({ ...payload });
    try {
      const { data } = await AxiosInstance.get(
        `/v1/${group}?${parent}=${id}&page=${page}`
      );
      const payload = { ...state };
      payload[id] = {
        ...payload[id],
        data:
          data.data.length > 0
            ? [...payload[id].data, ...data.data]
            : payload[id].data,
        length: data.total_length,
        loadMore: false,
      };
      setState({ ...payload });
      const newKeys = data.data.map(e => e.id);
      if (newKeys.length > 0) {
        if (group === "subjects") {
          setBranches(createLayer(branches, [id]));
        } else if (group === "chapter_") {
          setBatches(createLayer(batches, [id]));
        }
      }
    } catch (error) {
      console.log(error);
      const payload = { ...state };
      payload[id] = {
        ...payload[id],
        loadMore: null,
        error: error.response ? error?.response?.data?.error : "Network issue",
      };
      setState({ ...payload });
    }
  };

  //! Branch and its Logic Starts
  const [branches, setBranches] = useState(null);
  const [loadedBranches, setLoadedBranches] = useState([]);

  const fetchBranches = async id => {
    const updatedState = { ...branches };
    updatedState[id] = { ...updatedState[id], loading: true };
    setBranches(updatedState);
    try {
      const { data } = await AxiosInstance.get(
        `/v1/chapter_list?subject_id=${id}`
      );
      const updatedState = { ...branches };
      updatedState[id] = {
        ...updatedState[id],
        loading: false,
        data: data.data.length > 0 ? data.data : null,
        length: data.total_length,
      };
      setBranches(updatedState);
      const newKeys = data.data.map(e => e.id);
      if (newKeys.length > 0) {
        setBatches(createLayer(batches, [id]));
      }
    } catch (error) {
      const updatedState = { ...branches };
      updatedState[id] = {
        ...updatedState[id],
        loading: false,
        error: error.response ? error?.response?.data?.error : "Network issue",
        data: null,
      };
      setBranches(updatedState);
    }
  };
  //! Branch and its Logic ends

  // //! Batch and its Logic Starts
  const [batches, setBatches] = useState(null);
  const [loadedBatches, setLoadedBatches] = useState([]);
  const fetchBatches = async id => {
    const updatedState = { ...batches };
    updatedState[id] = { ...updatedState[id], loading: true };
    setBatches(updatedState);
    try {
      const { data } = await AxiosInstance.get(
        `/v1/topic_list?chapter_id=${id}`
      );
      const updatedState = { ...batches };
      updatedState[id] = {
        ...updatedState[id],
        loading: false,
        data: data.data.length > 0 ? data.data : null,
        length: data.total_length,
      };
      setBatches(updatedState);
    } catch (error) {
      const updatedState = { ...batches };
      updatedState[id] = {
        ...updatedState[id],
        loading: false,
        error: error.response ? error?.response?.data?.error : "Network issue",
        data: null,
      };
      setBatches(updatedState);
    }
  };
  // //! Batch and its Logic ends

  const [toggledNode, setToggledNode] = useState([]);

  //Tree view call backs
  const handleSelect = (x, y) => {
    const nodeId = y.split("@@")[1].split("#")[1];
    const nodeName = y.split("@@")[1].split("#")[0];
    if (nodeName === "subject" && !loadedOrg.includes(nodeId)) {
      fetchBranches(nodeId);
      setLoadedOrg([...loadedOrg, nodeId]);
    } else if (nodeName === "chapter" && !loadedBranches.includes(nodeId)) {
      fetchBatches(nodeId, y);
      setLoadedBranches([...loadedBatches, nodeId]);
    } else if (nodeName === "topic" && !loadedBatches.includes(nodeId)) {
      // fetchSubtopic(nodeId, y);
      setLoadedBatches([...loadedBatches, nodeId]);
    }
  };

  return <TreeContext.Provider value={{}}>{children}</TreeContext.Provider>;
};
