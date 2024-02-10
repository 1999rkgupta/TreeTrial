import PropTypes from "prop-types";
import SvgIcon from "@mui/material/SvgIcon";
import { alpha, styled } from "@mui/material/styles";
import { TreeView, TreeItem, treeItemClasses } from "@mui/x-tree-view";
import Collapse from "@mui/material/Collapse";
import { useSpring, animated } from "@react-spring/web";
import { useState, useEffect } from "react";
import "./treeStyle.css";
import AxiosInstance from "./AxiosInstance";

function MinusSquare(props) {
  return (
    <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#F25620"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </SvgIcon>
  );
}

function PlusSquare(props) {
  return (
    <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
      tslint:disable-next-line: max-line-length
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#F25620"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </SvgIcon>
  );
}

function CloseSquare(props) {
  return (
    <SvgIcon
      className="close"
      fontSize="inherit"
      style={{ width: 14, height: 14 }}
      {...props}
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#F25620"
        strokeWidth="2.5"
        strokeLinecap="butt"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="8" y1="12" x2="16" y2="12"></line>
      </svg>
    </SvgIcon>
  );
}

function TransitionComponent(props) {
  const style = useSpring({
    from: {
      opacity: 0,
      transform: "translate3d(20px,0,0)",
    },
    to: {
      opacity: props.in ? 1 : 0,
      transform: `translate3d(${props.in ? 0 : 20}px,0,0)`,
    },
  });

  return (
    <animated.div style={style}>
      <Collapse {...props} />
    </animated.div>
  );
}

TransitionComponent.propTypes = {
  in: PropTypes.bool,
};

const StyledTreeItem = styled(props => (
  <TreeItem {...props} TransitionComponent={TransitionComponent} />
))(({ theme }) => ({
  [`& .${treeItemClasses.iconContainer}`]: {
    "& .close": {
      opacity: 0.3,
    },
  },
  [`& .${treeItemClasses.group}`]: {
    marginLeft: 15,
    paddingLeft: 4,
    borderLeft: `1px solid ${alpha(theme.palette.text.primary, 0.3)}`,
  },
}));
//* helper
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
        videos: [],
        loadMoreVideo: false,
        videoLength: 0,
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
        videos: [],
        videoLength: 0,
        loadMoreVideo: false,
      };
    });
    return obj;
  }
};
//? Actual Component
let Tree1 = () => {
  //! Subjects and its Logic Starts
  const [loadedSubjects, setLoadedSubjects] = useState([]);
  const [subjects, setSubjects] = useState({
    data: [],
    loading: false,
    loadMore: false,
    error: null,
    length: 0,
  });
  useEffect(() => {
    let fetchSubject = async () => {
      try {
        const { data } = await AxiosInstance.get(`/v1/subjects`);
        setSubjects({
          ...subjects,
          data: data.data && data.data.length > 0 ? data.data : null,
          loading: false,
          length: data.total_length,
        });
        const newKeys = data.data.map(e => e.id);
        if (newKeys.length > 0) {
          setChapters(createLayer(chapters, newKeys));
        }
      } catch (error) {
        setSubjects({
          ...subjects,
          data: null,
          error: error.response ? error.response.data.message : "Network issue",
          loading: false,
        });
      }
    };

    fetchSubject();
  }, []);
  const fetchMoreSubject = async () => {
    setSubjects({ ...subjects, loadMore: true });
    const page = Math.ceil(subjects.data.length / 10) + 1;
    try {
      const { data } = await AxiosInstance.get(`/v1/subjects?page=${page}`);
      setSubjects({
        ...subjects,
        data:
          data.data.length > 0
            ? [...subjects.data, ...data.data]
            : subjects.data,
        loadMore: false,
        length: data.total_length,
      });
      const newKeys = data.data.map(e => e.id);
      if (newKeys.length > 0) {
        setChapters(createLayer(chapters, newKeys));
      }
    } catch (error) {
      setSubjects({
        ...subjects,
        loadMore: null,
        error: error.response ? error?.response?.data?.error : "Network issue",
      });
    }
  };
  //! Subjects and its Logic ends
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
      const newKeys = data.data.map(e =>
        group === "sub_topics" ? e.ID : e.id
      );
      if (newKeys.length > 0) {
        if (group === "subjects") {
          setChapters(createLayer(chapters, [id]));
        } else if (group === "chapter_") {
          setTopics(createLayer(topics, [id]));
        } else if (group === "topics") {
          setSub_topics(createLayer(sub_topics, [id]));
        } else if (group === "sub_topics") {
          setVideos(createFinalLayer(videos, newKeys));
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

  //! Chapters and its Logic Starts
  const [chapters, setChapters] = useState(null);
  const [loadedChapters, setLoadedChapters] = useState([]);

  const fetchChapter = async id => {
    const updatedState = { ...chapters };
    updatedState[id] = { ...updatedState[id], loading: true };
    setChapters(updatedState);
    try {
      const { data } = await AxiosInstance.get(
        `/v1/chapter_list?subject_id=${id}`
      );
      const updatedState = { ...chapters };
      updatedState[id] = {
        ...updatedState[id],
        loading: false,
        data: data.data.length > 0 ? data.data : null,
        length: data.total_length,
      };
      setChapters(updatedState);
      const newKeys = data.data.map(e => e.id);
      if (newKeys.length > 0) {
        setTopics(createLayer(topics, [id]));
      }
    } catch (error) {
      const updatedState = { ...chapters };
      updatedState[id] = {
        ...updatedState[id],
        loading: false,
        error: error.response ? error?.response?.data?.error : "Network issue",
        data: null,
      };
      setChapters(updatedState);
    }
  };
  //! Chapters and its Logic ends
  // for common
  // //! Topics and its Logic Starts
  const [topics, setTopics] = useState(null);
  const [loadedTopics, setLoadedTopics] = useState([]);
  const fetchTopic = async id => {
    const updatedState = { ...topics };
    updatedState[id] = { ...updatedState[id], loading: true };
    setTopics(updatedState);
    try {
      const { data } = await AxiosInstance.get(
        `/v1/topic_list?chapter_id=${id}`
      );
      const updatedState = { ...topics };
      updatedState[id] = {
        ...updatedState[id],
        loading: false,
        data: data.data.length > 0 ? data.data : null,
        length: data.total_length,
      };
      setTopics(updatedState);
      const newKeys = data.data.map(e => e.id);
      if (newKeys.length > 0) {
        setSub_topics(createLayer(sub_topics, [id]));
      }
    } catch (error) {
      const updatedState = { ...topics };
      updatedState[id] = {
        ...updatedState[id],
        loading: false,
        error: error.response ? error?.response?.data?.error : "Network issue",
        data: null,
      };
      setTopics(updatedState);
    }
  };
  // //! Topics and its Logic ends

  // //! Subtopics and its Logic Starts
  const [sub_topics, setSub_topics] = useState([]);
  const [loadedSubtopics, setLoadedSubtopics] = useState([]);
  const fetchSubtopic = async id => {
    const updatedState = { ...sub_topics };
    updatedState[id] = { ...updatedState[id], loading: true };
    setSub_topics(updatedState);
    try {
      const { data } = await AxiosInstance.get(
        `/v1/sub_topic_list?topic_id=${id}`
      );
      const updatedState = { ...sub_topics };
      updatedState[id] = {
        ...updatedState[id],
        loading: false,
        data: data.data.length > 0 ? data.data : null,
        length: data.total_length,
      };
      setSub_topics(updatedState);
      const newKeys = data.data.map(e => e.ID);
      if (newKeys.length > 0) {
        setVideos(createFinalLayer(videos, newKeys));
      }
    } catch (error) {
      const updatedState = { ...sub_topics };
      updatedState[id] = {
        ...updatedState[id],
        loading: false,
        error: error.response ? error?.response?.data?.error : "Network issue",
        data: null,
      };
      setSub_topics(updatedState);
    }
  };
  // //! Subtopics and its Logic ends

  const [toggledNode, setToggledNode] = useState([]);
  // //! Videos and its Logic Starts
  //for middle layer

  //for final layer
  const [videos, setVideos] = useState(null);
  const createFinalLayer = (node, keys) => {
    if (videos) {
      const uniqueKeys = keys.filter(e => !Object.keys(videos).includes(e));
      const obj = {};
      uniqueKeys.forEach(e => {
        obj[e] = {
          loading: false,
          error: null,
          loadMoreVideo: false,
          videos: [],
          videoLength: 0,
        };
      });
      return { ...videos, ...obj };
    } else {
      const obj = {};
      keys.forEach(e => {
        obj[e] = {
          loading: false,
          error: null,
          loadMoreVideo: false,
          videos: [],
          videoLength: 0,
        };
      });
      return obj;
    }
  };
  //Tree view call backs
  const handleSelect = (x, y) => {
    const nodeId = y.split("@@")[1].split("#")[1];
    const nodeName = y.split("@@")[1].split("#")[0];
    if (nodeName === "subject" && !loadedSubjects.includes(nodeId)) {
      fetchChapter(nodeId);
      setLoadedSubjects([...loadedSubjects, nodeId]);
    } else if (nodeName === "chapter" && !loadedChapters.includes(nodeId)) {
      fetchTopic(nodeId, y);
      setLoadedChapters([...loadedTopics, nodeId]);
    } else if (nodeName === "topic" && !loadedTopics.includes(nodeId)) {
      fetchSubtopic(nodeId, y);
      setLoadedTopics([...loadedTopics, nodeId]);
    } else if (nodeName === "sub_topic" && !loadedSubtopics.includes(nodeId)) {
      setLoadedSubtopics([...loadedSubtopics, nodeId]);
    }
  };
  // //! Videos and its Logic Starts
  return (
    <section style={{ width: "100%", position: "relative" }} id="tree2">
      <TreeView
        aria-label="customized"
        className="treeCont"
        defaultCollapseIcon={<MinusSquare />}
        defaultExpandIcon={<PlusSquare />}
        defaultEndIcon={<CloseSquare />}
        sx={{
          flexGrow: 1,
        }}
        onNodeToggle={(a, b) => {
          const action = b.length > toggledNode.length ? true : false;
          if (action) {
            const previousArray = toggledNode;
            const newValue =
              toggledNode.length > 0
                ? b.filter(e => !previousArray.includes(e))[0]
                : b[0];
            handleSelect("x", newValue);
            const modifiedArray =
              newValue === ""
                ? b
                : b.filter(
                    e =>
                      !e.includes(`@@${newValue.split("@@")[1].split("#")[0]}#`)
                  );
            setToggledNode([...modifiedArray, newValue]);
          } else {
            setToggledNode(b);
          }
        }}
      >
        {
          <>
            {subjects.loading ? (
              "Loading..."
            ) : subjects.data === null ? (
              `${subjects.error || "No data Found"}`
            ) : (
              <>
                <header className="treeHeaderY">
                  <ul>
                    <li>Branch</li>
                  </ul>
                </header>
                {subjects.data.map(sub => {
                  return (
                    <StyledTreeItem
                      className="subjectBranch"
                      nodeId={`subjects@@subject#${sub.id}`}
                      key={`subjects@@subject#${sub.id}`}
                      label={
                        <section id="subjectBranch">
                          <span title={`Subject - ${sub.name}`}>
                            {sub.name}
                          </span>
                        </section>
                      }
                    >
                      <>
                        {chapters &&
                          Object.keys(chapters).length > 0 &&
                          chapters[sub.id] && (
                            <>
                              {chapters[sub.id].loading ? (
                                <small
                                  style={{
                                    color: "purple",
                                    fontWeight: "bold",
                                  }}
                                >
                                  Loading..
                                </small>
                              ) : chapters[sub.id].data ||
                                chapters[sub.id].video ? (
                                <>
                                  {chapters[sub.id].data ? (
                                    chapters[sub.id].data.map(chp => {
                                      return (
                                        <StyledTreeItem
                                          className="subjectBranch"
                                          nodeId={`subject${sub.id}-@@chapter#${chp.id}`}
                                          key={`subject${sub.id}-@@chapter#${chp.id}`}
                                          label={
                                            <section id="chapterBranch">
                                              <span
                                                title={`Chapter - ${chp.name}`}
                                              >
                                                {/* <b
                                                  style={{
                                                    fontWeight: "bold",
                                                    fontSize: "x-small",
                                                    color: "cadetBlue",
                                                  }}
                                                >
                                                  Chapter :{" "}
                                                </b> */}
                                                {chp.name}
                                              </span>
                                            </section>
                                          }
                                        >
                                          <>
                                            {topics &&
                                              Object.keys(topics).length > 0 &&
                                              topics[chp.id] && (
                                                <>
                                                  {topics[chp.id].loading ? (
                                                    <small
                                                      style={{
                                                        color: "purple",
                                                        fontWeight: "bold",
                                                      }}
                                                    >
                                                      Loading..
                                                    </small>
                                                  ) : topics[chp.id].data ||
                                                    topics[chp.id].video ? (
                                                    <>
                                                      {topics[chp.id].video ? (
                                                        <>
                                                          <ul
                                                            className="treeHeader"
                                                            style={{
                                                              display: "flex",
                                                              listStyle: "none",
                                                              padding:
                                                                "5px 15px 5px 0",
                                                              borderBottom:
                                                                "1px ridge #5f5a5a28",
                                                              fontWeight:
                                                                "bold",
                                                              color: "#F25620",
                                                            }}
                                                          >
                                                            <li
                                                              style={{
                                                                flexBasis:
                                                                  "70%",
                                                              }}
                                                            >
                                                              Video title
                                                            </li>
                                                            <li
                                                              style={{
                                                                flexBasis:
                                                                  "15%",
                                                              }}
                                                            >
                                                              info
                                                            </li>
                                                          </ul>
                                                        </>
                                                      ) : null}
                                                      {topics[chp.id]
                                                        .loadMoreVideo !==
                                                        null &&
                                                        topics[chp.id]
                                                          .videoLength > 10 &&
                                                        topics[chp.id]
                                                          .videoLength /
                                                          topics[chp.id].video
                                                            .length >
                                                          1 && (
                                                          <button
                                                            disabled={
                                                              topics[chp.id]
                                                                .loadMoreVideo
                                                            }
                                                            title={
                                                              !topics[chp.id]
                                                                .loadMoreVideo
                                                                ? "Click to loadMore videos1"
                                                                : ""
                                                            }
                                                            style={{
                                                              border: "none",
                                                              background:
                                                                "transparent",
                                                              padding: "5px",
                                                              color: "purple",
                                                              fontWeight:
                                                                "bolder",
                                                              fontSize:
                                                                "x-small",
                                                              textDecoration:
                                                                !topics[chp.id]
                                                                  .loadMoreVideo
                                                                  ? "underline"
                                                                  : "none",
                                                              cursor: !topics[
                                                                chp.id
                                                              ].loadMoreVideo
                                                                ? "pointer"
                                                                : "not-allowed",
                                                            }}
                                                          >
                                                            {topics[chp.id]
                                                              .loadMoreVideo
                                                              ? "Loading..."
                                                              : "Load More videos"}
                                                          </button>
                                                        )}
                                                      {topics[chp.id].video &&
                                                        topics[chp.id].data && (
                                                          <hr
                                                            style={{
                                                              borderColor:
                                                                "red !important",
                                                              height: "1px",
                                                            }}
                                                          />
                                                        )}
                                                      {topics[chp.id].data ? (
                                                        topics[chp.id].data.map(
                                                          top => {
                                                            return (
                                                              <StyledTreeItem
                                                                className="subjectBranch"
                                                                nodeId={`subject${sub.id}-chapter${chp.id}-@@topic#${top.id}`}
                                                                key={`subject${sub.id}-chapter#${chp.id}-@@topic#${top.id}`}
                                                                label={
                                                                  <section id="chapterBranch">
                                                                    <span
                                                                      title={`Topic - ${top.name}`}
                                                                    >
                                                                      <b
                                                                        style={{
                                                                          fontWeight:
                                                                            "bold",
                                                                          fontSize:
                                                                            "x-small",
                                                                          color:
                                                                            "cadetBlue",
                                                                        }}
                                                                      >
                                                                        Topic :{" "}
                                                                      </b>
                                                                      {top.name}
                                                                    </span>
                                                                  </section>
                                                                }
                                                              >
                                                                {/* next tree child part */}
                                                              </StyledTreeItem>
                                                            );
                                                          }
                                                        )
                                                      ) : (
                                                        <small
                                                          style={{
                                                            color: "purple",
                                                            fontWeight: "bold",
                                                          }}
                                                        >
                                                          no topics found
                                                        </small>
                                                      )}
                                                      {topics[chp.id].length >
                                                        10 &&
                                                        topics[chp.id].length /
                                                          topics[chp.id].data
                                                            .length >
                                                          1 && (
                                                          <button
                                                            disabled={
                                                              topics[chp.id]
                                                                .loadMore
                                                            }
                                                            onClick={() => {
                                                              fetchMoreState(
                                                                chp.id,
                                                                topics,
                                                                setTopics,
                                                                "topic_list",
                                                                "chapter_id"
                                                              );
                                                            }}
                                                            title={
                                                              !topics[chp.id]
                                                                .loadMore
                                                                ? "Click to loadMore topics"
                                                                : ""
                                                            }
                                                            style={{
                                                              border: "none",
                                                              background:
                                                                "transparent",
                                                              padding: "5px",
                                                              color: "purple",
                                                              fontWeight:
                                                                "bolder",
                                                              fontSize:
                                                                "x-small",
                                                              textDecoration:
                                                                !topics[chp.id]
                                                                  .loadMore
                                                                  ? "underline"
                                                                  : "none",
                                                              cursor: !topics[
                                                                chp.id
                                                              ].loadMore
                                                                ? "pointer"
                                                                : "not-allowed",
                                                            }}
                                                          >
                                                            {topics[chp.id]
                                                              .loadMore
                                                              ? "Loading..."
                                                              : "Load More topics"}
                                                          </button>
                                                        )}
                                                    </>
                                                  ) : (
                                                    <small
                                                      style={{
                                                        color: "purple",
                                                        fontWeight: "bold",
                                                      }}
                                                    >
                                                      {topics[chp.id].error ||
                                                        "No data found"}
                                                    </small>
                                                  )}
                                                </>
                                              )}
                                          </>
                                        </StyledTreeItem>
                                      );
                                    })
                                  ) : (
                                    <small
                                      style={{
                                        color: "purple",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      no chapters found
                                    </small>
                                  )}
                                  {chapters[sub.id].length > 10 &&
                                    chapters[sub.id].length /
                                      chapters[sub.id].data.length >
                                      1 && (
                                      <button
                                        disabled={chapters[sub.id].loadMore}
                                        onClick={() => {
                                          fetchMoreState(
                                            sub.id,
                                            chapters,
                                            setChapters,
                                            "chapter_list",
                                            "subject_id"
                                          );
                                        }}
                                        title={
                                          !chapters[sub.id].loadMore
                                            ? "Click to loadMore chapters"
                                            : ""
                                        }
                                        style={{
                                          border: "none",
                                          background: "transparent",
                                          padding: "5px",
                                          color: "purple",
                                          fontWeight: "bolder",
                                          fontSize: "x-small",
                                          textDecoration: !chapters[sub.id]
                                            .loadMore
                                            ? "underline"
                                            : "none",
                                          cursor: !chapters[sub.id].loadMore
                                            ? "pointer"
                                            : "not-allowed",
                                        }}
                                      >
                                        {chapters[sub.id].loadMore
                                          ? "Loading..."
                                          : "Load More chapters"}
                                      </button>
                                    )}
                                </>
                              ) : (
                                <small
                                  style={{
                                    color: "purple",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {chapters[sub.id].error || "No data found"}
                                </small>
                              )}
                            </>
                          )}
                      </>
                    </StyledTreeItem>
                  );
                })}
                {subjects.length > 10 &&
                  subjects.length / subjects.data.length > 1 && (
                    <button
                      disabled={subjects.loadMore}
                      onClick={() => {
                        fetchMoreSubject();
                      }}
                      title={!subjects.loadMore && "Click to loadMore subjects"}
                      style={{
                        border: "none",
                        background: "transparent",
                        padding: "5px",
                        color: "purple",
                        fontWeight: "bolder",
                        fontSize: "x-small",
                        textDecoration: !subjects.loadMore
                          ? "underline"
                          : "none",
                        cursor: !subjects.loadMore ? "pointer" : "not-allowed",
                      }}
                    >
                      {subjects.loadMore ? "Loading..." : "Load More subjects"}
                    </button>
                  )}
              </>
            )}
          </>
        }
      </TreeView>
    </section>
  );
};
export default Tree1;
