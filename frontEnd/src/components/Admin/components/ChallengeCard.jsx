import AceEditor from "react-ace";
import { useState } from "react";

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-monokai";

function ChallengeCard(props) {
  const [code, setCode] = useState(props.challenge.codeSnippet);
  const [codeLanguage, setCodeLanguage] = useState(
    props.challenge.codeLanguage
  );
  const [challenge, setChallenge] = useState(props.challenge);
  const [openStates, setOpenState] = useState({
    main: false,
    tags: false,
    hints: false,
    content: false,
    instance: false,
    specifics: false,
  });

  return (
    <div
      style={{ flex: "0 0 100%", maxWidth: "50%" }}
      className="top"
      id={"challenge-top" + challenge._id}
    >
      <div
        className="col-md-6 mb-3"
        id={"challenge-card" + challenge._id}
        style={{ maxWidth: "100%" }}
      >
        <div
          className="card"
          style={{
            borderTop:
              "4px solid " +
              (
                props.tagColors.find((x) => challenge.tags[0] === x.name) || {
                  color: "white",
                }
              ).color,
          }}
          id={"challenge" + challenge._id}
        >
          <div
            className="card-header"
            data-target={"#problem_id_" + challenge._id}
            data-toggle="collapse"
            aria-expanded="false"
            aria-controls={"problem_id_" + challenge._id}
            // draggable="true" // PREVENTS GOOD INPUT CAPTURE
            // onDragStart={props.drag}
            id={"challenge-header" + challenge._id}
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <div>
              {challenge.isInstance ? (
                <span
                  className="fa-brands fa-docker"
                  style={{ fontSize: "26px", marginRight: "5px" }}
                ></span>
              ) : null}
              <input
                id={"name" + challenge._id}
                onClick={(e) => e.stopPropagation()}
                defaultValue={challenge.name}
                placeholder="Name"
                type="text"
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row-reverse",
                }}
              >
                {challenge.tags.map((tag) => (
                  <span
                    key={tag + challenge._id}
                    className="badge color_white align-self-end"
                    style={{
                      marginRight: "5px",
                      backgroundColor: (
                        props.tagColors.find((x) => tag == x.name) || {
                          color: "black",
                        }
                      ).color,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span className="badge align-self-end">
                <input
                  onClick={(e) => e.stopPropagation()}
                  id={"points" + challenge._id}
                  defaultValue={challenge.points}
                  placeholder="0"
                  style={{ width: "50px" }}
                  type="number"
                  step="25"
                />{" "}
                pts
              </span>
            </div>
          </div>
          <div id={"problem_id_" + challenge._id} className="collapse">
            <div className="card-body">
              <blockquote className="card-blockquote">
                <h6 className="solvers">
                  Solves:{" "}
                  <span className="solver_num">{challenge.solveCount}</span>{" "}
                  &nbsp;
                </h6>

                {/* MAIN TAB */}
                <div style={{ display: "block" }}>
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      let newOpenStates = { ...openStates };
                      newOpenStates.main = !openStates.main;
                      setOpenState(newOpenStates);
                    }}
                  >
                    {openStates.main ? (
                      <span className="fa-solid fa-chevron-down" />
                    ) : (
                      <span className="fa-solid fa-chevron-right" />
                    )}{" "}
                    Main
                  </span>
                </div>
                <div
                  style={{
                    visibility: openStates.main ? "visible" : "hidden",
                    position: openStates.main ? "relative" : "absolute",
                  }}
                >
                  <hr />
                  <div style={{ display: "block" }}>
                    <span className="color_white">Hidden: </span>
                    <span className="color_white">
                      <select
                        defaultValue={challenge.hidden.toString()}
                        id={"hidden" + challenge._id}
                      >
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    </span>
                  </div>

                  <hr />
                  <div style={{ display: "block" }}>
                    <span className="color_white">Difficulty: </span>
                    <span className="color_white">
                      <select
                        defaultValue={challenge.level.toString()}
                        id={"level" + challenge._id}
                      >
                        <option value="0">Easy</option>
                        <option value="1">Medium</option>
                        <option value="2">Hard</option>
                        <option value="3">Ninja</option>
                      </select>
                    </span>
                  </div>

                  <hr />
                  <div style={{ display: "block" }}>
                    <label>Info:</label>
                    <div
                      onPaste={(e) => {
                        setTimeout(() => {
                          e.target.innerHTML = e.target.innerText;
                        }, 10);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.shiftKey === false) {
                          e.preventDefault();
                          document.execCommand("insertLineBreak");
                        }
                      }}
                      contentEditable="true"
                      suppressContentEditableWarning={true}
                      style={{
                        backgroundColor: "rgb(30, 32, 55)",
                        outline: "none",
                        whiteSpace: "pre-wrap",
                      }}
                      id={"info" + challenge._id}
                    >
                      {challenge.info}
                    </div>
                  </div>
                </div>

                {/* TAGS TAB */}
                <div style={{ display: "block" }}>
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      let newOpenStates = { ...openStates };
                      newOpenStates.tags = !openStates.tags;
                      setOpenState(newOpenStates);
                    }}
                  >
                    {openStates.tags ? (
                      <span className="fa-solid fa-chevron-down" />
                    ) : (
                      <span className="fa-solid fa-chevron-right" />
                    )}{" "}
                    Tags
                  </span>
                </div>
                <div
                  style={{
                    visibility: openStates.tags ? "visible" : "hidden",
                    position: openStates.tags ? "relative" : "absolute",
                  }}
                >
                  <hr />
                  {challenge.tags.map((tag, i) => {
                    return (
                      <div key={tag}>
                        <div style={{ display: "block" }}>
                          <button
                            className="btn btn-outline-danger mr-2"
                            type="button"
                            style={{ fontSize: "10px" }}
                            onClick={() => {
                              let updateChallenge = {
                                ...challenge,
                                tags: challenge.tags.filter((x) => x != tag),
                              };
                              setChallenge(updateChallenge);
                            }}
                          >
                            -
                          </button>
                          <label>Tag#{i + 1}:</label>
                          <p
                            style={{
                              backgroundColor: "rgb(30, 32, 55)",
                              outline: "none",
                            }}
                            id={i + "tag" + challenge._id}
                          >
                            {tag}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <select id={"tagNew" + challenge._id}>
                    {props.tags.map((t) => (
                      <option value={t}>{t}</option>
                    ))}
                  </select>
                  <br />
                  <button
                    className="btn btn-outline-danger"
                    type="button"
                    onClick={() => {
                      const newTag = document.getElementById(
                        "tagNew" + challenge._id
                      ).value;

                      if (!challenge.tags.includes(newTag)) {
                        let updateChallenge = { ...challenge };
                        updateChallenge.tags.push(newTag);
                        setChallenge(updateChallenge);
                      }
                    }}
                  >
                    Add Tag
                  </button>
                  <hr />
                </div>

                {/* HINT TAB */}
                <div style={{ display: "block" }}>
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      let newOpenStates = { ...openStates };
                      newOpenStates.hints = !openStates.hints;
                      setOpenState(newOpenStates);
                    }}
                  >
                    {openStates.hints ? (
                      <span className="fa-solid fa-chevron-down" />
                    ) : (
                      <span className="fa-solid fa-chevron-right" />
                    )}{" "}
                    Hints
                  </span>
                </div>
                <div
                  style={{
                    visibility: openStates.hints ? "visible" : "hidden",
                    position: openStates.hints ? "relative" : "absolute",
                  }}
                >
                  <hr />
                  {challenge.hints.map((hint, i) => {
                    return (
                      <div key={hint.id}>
                        <p
                          style={{
                            display: "none",
                          }}
                          id={i + "hintId" + challenge._id}
                        >
                          {hint.id}
                        </p>
                        <div style={{ display: "block" }}>
                          <label>Hint#{i + 1}:</label>
                          <button
                            className="btn btn-outline-danger"
                            type="button"
                            style={{ fontSize: "10px" }}
                            onClick={() => {
                              let updateChallenge = {
                                ...challenge,
                                hints: challenge.hints.filter((x) => x != hint),
                              };
                              setChallenge(updateChallenge);
                            }}
                          >
                            -
                          </button>
                          <p
                            style={{
                              backgroundColor: "rgb(30, 32, 55)",
                              outline: "none",
                            }}
                            contentEditable="true"
                            suppressContentEditableWarning={true}
                            id={i + "hintContent" + challenge._id}
                          >
                            {hint.content}
                          </p>
                        </div>

                        <div style={{ display: "flex" }}>
                          <label>Hint#{i + 1} Cost:</label>
                          <p
                            style={{
                              backgroundColor: "rgb(30, 32, 55)",
                              outline: "none",
                              minWidth: "5%",
                            }}
                            contentEditable="true"
                            suppressContentEditableWarning={true}
                            id={i + "hintCost" + challenge._id}
                          >
                            {hint.cost}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <button
                    className="btn btn-outline-danger"
                    type="button"
                    onClick={() => {
                      let updateChallenge = { ...challenge };
                      updateChallenge.hints.push({
                        id: Math.random().toString().substr(2, 4),
                        content: "Easy Peazy",
                        cost: 0,
                      });
                      setChallenge(updateChallenge);
                    }}
                  >
                    Add Hint
                  </button>
                  <hr />
                </div>

                {/* CONTENT TAB */}
                <div style={{ display: "block" }}>
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      let newOpenStates = { ...openStates };
                      newOpenStates.content = !openStates.content;
                      setOpenState(newOpenStates);
                    }}
                  >
                    {openStates.content ? (
                      <span className="fa-solid fa-chevron-down" />
                    ) : (
                      <span className="fa-solid fa-chevron-right" />
                    )}{" "}
                    Content
                  </span>
                </div>
                <div
                  style={{
                    visibility: openStates.content ? "visible" : "hidden",
                    position: openStates.content ? "relative" : "absolute",
                  }}
                >
                  <hr />
                  <div>
                    <label>File:</label>
                    <select
                      defaultValue={challenge.file}
                      id={"file" + challenge._id}
                    >
                      <option value="">None</option>
                      {props.assets.map((asset) => {
                        return (
                          <option value={asset.name} key={asset.name}>
                            {asset.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <hr />
                  <label>Code Snippet:</label>
                  <select
                    defaultValue={challenge.codeLanguage || codeLanguage}
                    id={"code_language" + challenge._id}
                    onChange={(e) => setCodeLanguage(e.target.value)}
                  >
                    <option value="none">None</option>
                    <option value="python">Python</option>
                    <option value="javascript">Javascript</option>
                  </select>
                  {codeLanguage !== "none" && (
                    <AceEditor
                      style={{
                        height: "300px",
                        width: "100%",
                        marginBottom: "16px",
                      }}
                      placeholder="Write code here..."
                      mode={codeLanguage}
                      theme="monokai"
                      name={"code" + challenge._id}
                      onChange={(currentCode) => setCode(currentCode)}
                      fontSize={14}
                      showPrintMargin={true}
                      showGutter={true}
                      highlightActiveLine={true}
                      value={code}
                      setOptions={{
                        enableBasicAutocompletion: false,
                        enableLiveAutocompletion: false,
                        enableSnippets: false,
                        showLineNumbers: true,
                        tabSize: 2,
                      }}
                    />
                  )}
                  <p hidden id={"code_snippet" + challenge._id}>
                    {code}
                  </p>
                  <hr />
                </div>

                {/* DOCKER TAB */}
                <div style={{ display: "block" }}>
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      let newOpenStates = { ...openStates };
                      newOpenStates.docker = !openStates.docker;
                      setOpenState(newOpenStates);
                    }}
                  >
                    {openStates.docker ? (
                      <span className="fa-solid fa-chevron-down" />
                    ) : (
                      <span className="fa-solid fa-chevron-right" />
                    )}{" "}
                    Docker
                  </span>
                </div>
                <div
                  style={{
                    visibility: openStates.docker ? "visible" : "hidden",
                    position: openStates.docker ? "relative" : "absolute",
                  }}
                >
                  <hr />
                  <div style={{ display: "block" }}>
                    <label>Github URL:</label>
                    <p
                      contentEditable="true"
                      suppressContentEditableWarning={true}
                      style={{
                        backgroundColor: "rgb(30, 32, 55)",
                        outline: "none",
                      }}
                      id={"githubUrl" + challenge._id}
                    >
                      {challenge.githubUrl}
                    </p>
                  </div>

                  <hr />
                  <div style={{ display: "block" }}>
                    <label>isInstance:</label>
                    <select
                      id={"isInstance" + challenge._id}
                      defaultValue={challenge.isInstance}
                    >
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  </div>

                  <hr />
                  {/* Only Show RandomFlag if Instance is On */}
                  {challenge.isInstance.toString() == "true" ? (
                    <div style={{ display: "block" }}>
                      <label for={"#randomFlag" + challenge._id}>
                        Random Flag:{" "}
                      </label>
                      <select
                        id={"randomFlag" + challenge._id}
                        defaultValue={challenge.randomFlag}
                      >
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    </div>
                  ) : (
                    <select
                      id={"randomFlag" + challenge._id}
                      defaultValue={challenge.randomFlag}
                      style={{
                        display: "none",
                      }}
                    >
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  )}
                  <hr />
                </div>

                <div style={{ display: "block" }}>
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      let newOpenStates = { ...openStates };
                      newOpenStates.specifics = !openStates.specifics;
                      setOpenState(newOpenStates);
                    }}
                  >
                    {openStates.specifics ? (
                      <span className="fa-solid fa-chevron-down" />
                    ) : (
                      <span className="fa-solid fa-chevron-right" />
                    )}{" "}
                    Specifics
                  </span>
                </div>
                <div
                  style={{
                    visibility: openStates.specifics ? "visible" : "hidden",
                    position: openStates.specifics ? "relative" : "absolute",
                  }}
                >
                  <hr />
                  <div style={{ display: "flex" }}>
                    <label>First Blood Bonus:</label>
                    <p
                      style={{
                        backgroundColor: "rgb(30, 32, 55)",
                        outline: "none",
                        minWidth: "5%",
                      }}
                      contentEditable="true"
                      suppressContentEditableWarning={true}
                      id={"firstBloodPoints" + challenge._id}
                    >
                      {challenge.firstBloodPoints}
                    </p>
                  </div>

                  {props.dynamicScoring.toString() == "true" ? (
                    <div style={{ display: "block" }}>
                      <hr />
                      <label>Minimum Points:</label>{" "}
                      <p
                        contentEditable="true"
                        suppressContentEditableWarning={true}
                        style={{
                          backgroundColor: "rgb(30, 32, 55)",
                          outline: "none",
                        }}
                        id={"minimumPoints" + challenge._id}
                      >
                        {challenge.minimumPoints}
                      </p>
                    </div>
                  ) : (
                    <p
                      style={{
                        display: "none",
                      }}
                      id={"minimumPoints" + challenge._id}
                    >
                      {challenge.minimumPoints}
                    </p>
                  )}

                  <hr />
                  <div>
                    <label>Requirement:</label>{" "}
                    <select
                      defaultValue={challenge.requirement}
                      id={"requirement" + challenge._id}
                    >
                      <option value="">None</option>
                      {props.challenges
                        .filter((x) => x._id !== challenge._id)
                        .map((challenge) => {
                          return (
                            <option value={challenge._id} key={challenge.name}>
                              {challenge.name}
                            </option>
                          );
                        })}
                    </select>
                  </div>

                  <hr />
                  {/* Only Show Flag if RandomFlag is Off */}
                  {challenge.randomFlag.toString() == "false" ? (
                    <div style={{ display: "block" }}>
                      <label>Flag:</label>
                      <p
                        contentEditable="true"
                        suppressContentEditableWarning={true}
                        style={{
                          backgroundColor: "rgb(30, 32, 55)",
                          outline: "none",
                        }}
                        id={"flag" + challenge._id}
                      >
                        {challenge.flag}
                      </p>
                    </div>
                  ) : (
                    <p
                      style={{
                        display: "none",
                      }}
                      id={"flag" + challenge._id}
                    >
                      {challenge.flag}
                    </p>
                  )}
                </div>

                <hr />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <button
                    id="submit_p2"
                    className="btn btn-outline-danger"
                    type="button"
                    onClick={() => {
                      props.saveChallenge(challenge);
                    }}
                  >
                    Save
                  </button>
                  <button
                    id="submit_p2"
                    className="btn btn-outline-danger"
                    data-toggle="modal"
                    data-target="#confirmModal"
                    onClick={(e) => {
                      props.setAction({
                        function: props.deleteChallenge,
                        e: e,
                        data: challenge,
                      });
                    }}
                  >
                    Delete
                  </button>
                </div>
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChallengeCard;
