import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import AxiosInstance from "./AxiosInstance";

export const TreeContext = createContext();

export const TreeContextProvider = ({ children }) => {
  const [subjects, setSubjects] = useState([]);
  const [subjectLoad, setSubjectLoad] = useState(true);
  const [taskType, setTaskType] = useState([]);
  const [toggledNode, setToggledNode] = useState([]);
  const [questionStatus, setQuestionStatus] = useState([]);
  const [difficulty, setDifficulty] = useState([]);
  // drop down states
  useEffect(() => {
    setSubjectLoad(true);
    let fetchBatch = async () => {
      try {
        let { data } = await AxiosInstance.get(
          "/v1/subjects?limit=10&show_question_count"
        );
        setSubjects(data.data);
        let response = await AxiosInstance.get("/v1/type_of_task");
        setTaskType(response.data.data);
        let difficultyData = await AxiosInstance.get(
          "/v1/question_difficulty_level"
        );
        setDifficulty(difficultyData.data.data);
        let statusData = await AxiosInstance.get("/v1/question_status");
        setQuestionStatus(statusData.data.data);
        setSubjectLoad(false);
      } catch (error) {
        console.log(error);
        setSubjectLoad(false);
      }
    };
    fetchBatch();
  }, []);

  // fetch onclick States
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);
  const [sub_topics, setSub_topics] = useState([]);
  const [question, setQuestion] = useState([]);
  const [loadChapter, setLoadChapter] = useState(false);
  //fetch subject
  const [loadQuestion, setLoadQuestion] = useState(false);
  const fetchQuestion = async (group, ids, exl, task, status) => {
    const concatUnique = (existing, newData) => {
      newData.forEach(newObj => {
        const exists = existing.some(
          existingObj => existingObj.ID === newObj.ID
        );
        if (!exists) {
          existing.push(newObj);
        }
      });

      return existing;
    };
    setLoadQuestion(true);
    try {
      if (status) {
        const { data } = await AxiosInstance.get(
          exl !== null
            ? `/v1/questions?limit=100&${group}=${ids}&${exl}&${task}&${status}`
            : `/v1/questions?limit=100&${group}=${ids}&${task}&${status}`
        );
        setQuestion(
          data.data.length > 0 ? concatUnique(question, data.data) : question
        );
        setLoadQuestion(false);
      } else {
        const { data } = await AxiosInstance.get(
          exl !== null
            ? `/v1/questions?limit=100&${group}=${ids}&${exl}&${task}`
            : `/v1/questions?limit=100&${group}=${ids}&${task}`
        );
        setQuestion(
          data.data.length > 0 ? concatUnique(question, data.data) : question
        );
        setLoadQuestion(false);
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.error.message);
        setLoadQuestion(false);
        //   setQuestion(null);
      } else {
        toast.error("Something went wrong");
        console.log(error);
        setLoadQuestion(false);
        //   setQuestion(null);
      }
    }
  };
  //fetch Chapter
  const [loadedChapter, setLoadedChapter] = useState([]);
  const fetchChapter = async (id, name) => {
    if (!toggledNode.includes(name)) {
      if (chapters.length === 0) {
        setLoadedChapter(true);
        const { data } = await AxiosInstance.get(
          `/v1/chapter_list?limit=50&subject_id=${id}&show_question_count`
        );
        setChapters([...chapters, ...data.data]);
        setLoadedChapter([...loadedChapter, id]);
      } else if (
        subjects.length > 0 &&
        loadedChapter.length > 0 &&
        loadedChapter.filter(ex => ex === id).length === 0
      ) {
        setLoadChapter(true);
        const { data } = await AxiosInstance.get(
          `/v1/chapter_list?limit=50&subject_id=${id}&show_question_count`
        );
        setChapters([...chapters, ...data.data]);
        setLoadedChapter([...loadedChapter, id]);
        setLoadChapter(false);
      }
    }
  };
  //fetch Topic
  const [loadedTopic, setLoadedTopic] = useState([]);
  const [loadTopic, setLoadTopic] = useState(false);
  const fetchTopic = async (id, name) => {
    if (!toggledNode.includes(name)) {
      if (topics.length === 0) {
        setLoadTopic(true);
        const { data } = await AxiosInstance.get(
          `/v1/topic_list?limit=50&chapter_id=${id}&show_question_count`
        );
        setTopics([...topics, ...data.data]);
        setLoadedTopic([...loadedTopic, id]);
        setLoadTopic(false);
      } else if (
        subjects.length > 0 &&
        loadedTopic.length > 0 &&
        loadedTopic.filter(ex => ex === id).length === 0
      ) {
        setLoadTopic(true);
        const { data } = await AxiosInstance.get(
          `/v1/topic_list?limit=50&chapter_id=${id}&show_question_count`
        );
        setTopics([...topics, ...data.data]);
        setLoadedTopic([...loadedTopic, id]);
        setLoadTopic(false);
      }
    }
  };
  //fetch Sub Topic
  const [loadedSubTopic, setLoadedSubTopic] = useState([]);
  const [loadSubTopic, setLoadSubTopic] = useState(false);
  const fetchSubTopic = async (id, name) => {
    if (!toggledNode.includes(name)) {
      if (sub_topics.length === 0) {
        setLoadSubTopic(true);
        const { data } = await AxiosInstance.get(
          `/v1/sub_topic_list?limit=50&topic_id=${id}&show_question_count`
        );
        setSub_topics([...sub_topics, ...data.data]);
        setLoadedSubTopic([...loadedTopic, id]);
        setLoadSubTopic(false);
      } else if (
        loadedTopic.length > 0 &&
        loadedSubTopic.length > 0 &&
        loadedSubTopic.filter(ex => ex === id).length === 0
      ) {
        setLoadSubTopic(true);
        const { data } = await AxiosInstance.get(
          `v1/sub_topic_list?limit=50&topic_id=${id}&show_question_count`
        );
        setSub_topics([...sub_topics, ...data.data]);
        setLoadedSubTopic([...loadedTopic, id]);
        setLoadSubTopic(false);
      }
    }
  };
  return (
    <TreeContext.Provider
      value={{
        subjectLoad,
        subjects,
        toggledNode,
        setToggledNode,
        taskType,
        questionStatus,
        difficulty,
        fetchChapter,
        chapters,
        loadChapter,
        fetchTopic,
        topics,
        loadTopic,
        fetchSubTopic,
        sub_topics,
        loadSubTopic,
        question,
        loadQuestion,
        fetchQuestion,
      }}
    >
      {children}
    </TreeContext.Provider>
  );
};
