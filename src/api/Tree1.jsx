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
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 11.023h-11.826q-.375 0-.669.281t-.294.682v0q0 .401.294 .682t.669.281h11.826q.375 0 .669-.281t.294-.682v0q0-.401-.294-.682t-.669-.281z" />
    </SvgIcon>
  );
}

function PlusSquare(props) {
  return (
    <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 12.977h-4.923v4.896q0 .401-.281.682t-.682.281v0q-.375 0-.669-.281t-.294-.682v-4.896h-4.923q-.401 0-.682-.294t-.281-.669v0q0-.401.281-.682t.682-.281h4.923v-4.896q0-.401.294-.682t.669-.281v0q.401 0 .682.281t.281.682v4.896h4.923q.401 0 .682.281t.281.682v0q0 .375-.281.669t-.682.294z" />
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
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M17.485 17.512q-.281.281-.682.281t-.696-.268l-4.12-4.147-4.12 4.147q-.294.268-.696.268t-.682-.281-.281-.682.294-.669l4.12-4.147-4.12-4.147q-.294-.268-.294-.669t.281-.682.682-.281.696 .268l4.12 4.147 4.12-4.147q.294-.268.696-.268t.682.281 .281.669-.294.682l-4.12 4.147 4.12 4.147q.294.268 .294.669t-.281.682zM22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0z" />
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
//? Actual Component
let Tree1 = () => {
  //! Organization and its Logic Starts
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
            {organization.loading ? (
              "Loading..."
            ) : organization.data === null ? (
              `${organization.error || "No data Found"}`
            ) : (
              <>
                <header className="treeHeaderY">
                  <ul>
                    <li>Organization</li>
                  </ul>
                </header>
                {organization.data.map(org => {
                  return (
                    <StyledTreeItem
                      className="subjectBranch"
                      nodeId={`subjects@@subject#${org.id}`}
                      key={`subjects@@subject#${org.id}`}
                      label={
                        <section id="subjectBranch">
                          <span title={`Organization - ${org.name}`}>
                            {org.name}
                          </span>
                        </section>
                      }
                    >
                      <>
                        {branches &&
                          Object.keys(branches).length > 0 &&
                          branches[org.id] && (
                            <>
                              {branches[org.id].loading ? (
                                <small
                                  style={{
                                    color: "purple",
                                    fontWeight: "bold",
                                  }}
                                >
                                  Loading..
                                </small>
                              ) : branches[org.id].data ? (
                                <>
                                  {branches[org.id].data ? (
                                    branches[org.id].data.map(brn => {
                                      return (
                                        <StyledTreeItem
                                          className="subjectBranch"
                                          nodeId={`subject${org.id}-@@chapter#${brn.id}`}
                                          key={`subject${org.id}-@@chapter#${brn.id}`}
                                          label={
                                            <section id="chapterBranch">
                                              <span
                                                title={`Branch - ${brn.name}`}
                                              >
                                                {brn.name}
                                              </span>
                                            </section>
                                          }
                                        >
                                          <>
                                            {batches &&
                                              Object.keys(batches).length > 0 &&
                                              batches[brn.id] && (
                                                <>
                                                  {batches[brn.id].loading ? (
                                                    <small
                                                      style={{
                                                        color: "purple",
                                                        fontWeight: "bold",
                                                      }}
                                                    >
                                                      Loading..
                                                    </small>
                                                  ) : batches[brn.id].data ? (
                                                    <>
                                                      {batches[brn.id].data ? (
                                                        batches[
                                                          brn.id
                                                        ].data.map(bat => {
                                                          return (
                                                            <StyledTreeItem
                                                              className="subjectBranch"
                                                              nodeId={`subject${org.id}-chapter${brn.id}-@@topic#${bat.id}`}
                                                              key={`subject${org.id}-chapter#${brn.id}-@@topic#${bat.id}`}
                                                              label={
                                                                <section id="chapterBranch">
                                                                  <span
                                                                    title={`Batch - ${bat.name}`}
                                                                  >
                                                                    {bat.name}
                                                                  </span>
                                                                </section>
                                                              }
                                                            >
                                                              {/* next tree child part */}
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
                                                          no batches found
                                                        </small>
                                                      )}
                                                      {batches[brn.id].length >
                                                        10 &&
                                                        batches[brn.id].length /
                                                          batches[brn.id].data
                                                            .length >
                                                          1 && (
                                                          <button
                                                            disabled={
                                                              batches[brn.id]
                                                                .loadMore
                                                            }
                                                            onClick={() => {
                                                              fetchMoreState(
                                                                brn.id,
                                                                batches,
                                                                setBatches,
                                                                "topic_list",
                                                                "chapter_id"
                                                              );
                                                            }}
                                                            title={
                                                              !batches[brn.id]
                                                                .loadMore
                                                                ? "Click to loadMore Batches"
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
                                                                !batches[brn.id]
                                                                  .loadMore
                                                                  ? "underline"
                                                                  : "none",
                                                              cursor: !batches[
                                                                brn.id
                                                              ].loadMore
                                                                ? "pointer"
                                                                : "not-allowed",
                                                            }}
                                                          >
                                                            {batches[brn.id]
                                                              .loadMore
                                                              ? "Loading..."
                                                              : "Load More batches"}
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
                                                      {batches[brn.id].error ||
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
                                      no branch found
                                    </small>
                                  )}
                                  {branches[org.id].length > 10 &&
                                    branches[org.id].length /
                                      branches[org.id].data.length >
                                      1 && (
                                      <button
                                        disabled={branches[org.id].loadMore}
                                        onClick={() => {
                                          fetchMoreState(
                                            org.id,
                                            branches,
                                            setBranches,
                                            "chapter_list",
                                            "subject_id"
                                          );
                                        }}
                                        title={
                                          !branches[org.id].loadMore
                                            ? "Click to loadMore Branches"
                                            : ""
                                        }
                                        style={{
                                          border: "none",
                                          background: "transparent",
                                          padding: "5px",
                                          color: "purple",
                                          fontWeight: "bolder",
                                          fontSize: "x-small",
                                          textDecoration: !branches[org.id]
                                            .loadMore
                                            ? "underline"
                                            : "none",
                                          cursor: !branches[org.id].loadMore
                                            ? "pointer"
                                            : "not-allowed",
                                        }}
                                      >
                                        {branches[org.id].loadMore
                                          ? "Loading..."
                                          : "Load More Branches"}
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
                                  {branches[org.id].error || "No data found"}
                                </small>
                              )}
                            </>
                          )}
                      </>
                    </StyledTreeItem>
                  );
                })}
                {organization.length > 10 &&
                  organization.length / organization.data.length > 1 && (
                    <button
                      disabled={organization.loadMore}
                      onClick={() => {
                        fetchMoreOrg();
                      }}
                      title={
                        !organization.loadMore &&
                        "Click to loadMore Organizations"
                      }
                      style={{
                        border: "none",
                        background: "transparent",
                        padding: "5px",
                        color: "purple",
                        fontWeight: "bolder",
                        fontSize: "x-small",
                        textDecoration: !organization.loadMore
                          ? "underline"
                          : "none",
                        cursor: !organization.loadMore
                          ? "pointer"
                          : "not-allowed",
                      }}
                    >
                      {organization.loadMore
                        ? "Loading..."
                        : "Load More organization"}
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
