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

  return (
    <div
      style={{ flex: "0 0 100%", maxWidth: "50%" }}
      className="top"
      id={"challenge-top" + props.challenge._id}
    >
      <div
        className="col-md-6 mb-3"
        id={"challenge-card" + props.challenge._id}
        style={{ maxWidth: "100%" }}
      >
        <div
          className={
            props.challenge.category.toLowerCase() === "crypto"
              ? "card category_crypt"
              : props.challenge.category.toLowerCase() === "web"
              ? "card category_web"
              : props.challenge.category.toLowerCase() === "osint"
              ? "card category_osint"
              : props.challenge.category.toLowerCase() === "reverse"
              ? "card category_reverse"
              : props.challenge.category.toLowerCase() === "pwn"
              ? "card category_pwning"
              : props.challenge.category.toLowerCase() === "forensics"
              ? "card category_forensics"
              : "card category_misc"
          }
          id={"challenge" + props.challenge._id}
        >
          <div
            className="card-header"
            data-target={"#problem_id_" + props.challenge._id}
            data-toggle="collapse"
            aria-expanded="false"
            aria-controls={"problem_id_" + props.challenge._id}
            draggable="true"
            onDragStart={props.drag} // DO NOT REMOVE!
            id={"challenge-header" + props.challenge._id}
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <div>
              {props.challenge.dockerCompose.length > 0 ? (
                <span
                  className="fa-brands fa-docker"
                  style={{ fontSize: "18px" }}
                ></span>
              ) : null}
              <span
                contentEditable="true"
                style={{ outline: "none" }}
                id={"name" + props.challenge._id}
              >
                {props.challenge.name}{" "}
              </span>
            </div>
            <span className="badge align-self-end">
              <span
                contentEditable="true"
                style={{ outline: "none" }}
                id={"points" + props.challenge._id}
              >
                {props.challenge.points}
              </span>{" "}
              points
            </span>
          </div>
          <div
            id={"problem_id_" + props.challenge._id}
            className="collapse card-body"
          >
            <blockquote className="card-blockquote">
              <div style={{ display: "flex" }}>
                <h6 className="solvers">
                  Solves:{" "}
                  <span className="solver_num">
                    {props.challenge.solveCount}
                  </span>{" "}
                  &nbsp;
                  <span className="color_white">Difficulty: </span>
                  <span className="color_white">
                    <select
                      defaultValue={props.challenge.level.toString()}
                      id={"level" + props.challenge._id}
                    >
                      <option value="0">Easy</option>
                      <option value="1">Medium</option>
                      <option value="2">Hard</option>
                      <option value="3">Ninja</option>
                    </select>
                  </span>
                </h6>
              </div>
              <label>Info:</label>
              <p
                contentEditable="true"
                style={{
                  backgroundColor: "rgb(30, 32, 55)",
                  outline: "none",
                }}
                id={"info" + props.challenge._id}
              >
                {props.challenge.info}
              </p>

              <label>Hint:</label>
              <p
                style={{
                  backgroundColor: "rgb(30, 32, 55)",
                  outline: "none",
                }}
                contentEditable="true"
                id={"hint" + props.challenge._id}
              >
                {props.challenge.hint}
              </p>

              <div style={{ display: "flex" }}>
                <label>Hint Cost:</label>
                <p
                  style={{
                    backgroundColor: "rgb(30, 32, 55)",
                    outline: "none",
                    minWidth: "5%",
                  }}
                  contentEditable="true"
                  id={"hintCost" + props.challenge._id}
                >
                  {props.challenge.hintCost}
                </p>
              </div>

              <div style={{ display: "flex" }}>
                <label>First Blood Bonus:</label>
                <p
                  style={{
                    backgroundColor: "rgb(30, 32, 55)",
                    outline: "none",
                    minWidth: "5%",
                  }}
                  contentEditable="true"
                  id={"firstBloodPoints" + props.challenge._id}
                >
                  {props.challenge.firstBloodPoints}
                </p>
              </div>

              <label>File:</label>
              <div style={{ marginBottom: "16px" }}>
                <select
                  defaultValue={props.challenge.file}
                  id={"file" + props.challenge._id}
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

              <label>Code Snippet:</label>
              <select
                defaultValue={props.challenge.codeLanguage || codeLanguage}
                id={"code_language" + props.challenge._id}
                onChange={(e) => setCodeLanguage(e.target.value)}
              >
                <option value="none">None</option>
                <option value="python">Python</option>
                <option value="javascript">Javascript</option>
              </select>
              {codeLanguage != "none" && (
                <AceEditor
                  style={{
                    height: "300px",
                    width: "100%",
                    marginBottom: "16px",
                  }}
                  placeholder="Write code here..."
                  mode={codeLanguage}
                  theme="monokai"
                  name={"code" + props.challenge._id}
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
              <p hidden id={"code_snippet" + props.challenge._id}>
                {code}
              </p>

              <br />
              <label>Docker-Compose ZIP:</label>
              {props.challenge.dockerCompose.length > 0 ? (
                <>
                  <button
                    className="btn btn-outline-danger btn-shadow"
                    data-toggle="modal"
                    data-target="#confirmModal"
                    onClick={(e) => {
                      e.preventDefault();
                      props.setAction({
                        function: props.removeDockerCompose,
                        e: e,
                        data: props.challenge,
                      });
                    }}
                    style={{ marginRight: "10px" }}
                  >
                    <span className="fa-solid fa-minus"></span>
                  </button>
                  {props.challenge.dockerCompose.slice(0, 8)}...
                  <br />
                  <label for={"#randomFlag" + props.challenge._id}>
                    Random Flag:{" "}
                  </label>
                  <select
                    id={"randomFlag" + props.challenge._id}
                    defaultValue={props.challenge.randomFlag}
                  >
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                </>
              ) : (
                <>
                  <select
                    id={"randomFlag" + props.challenge._id}
                    value="false"
                    style={{ display: "none" }}
                  />
                  <input
                    id={"dockerCompose" + props.challenge._id}
                    type="file"
                  />
                </>
              )}
              <br />
              <br />
              {props.dynamicScoring.toString() == "true" ? (
                <>
                  <label>Minimum Points:</label>{" "}
                  <p
                    contentEditable="true"
                    style={{
                      backgroundColor: "rgb(30, 32, 55)",
                      outline: "none",
                    }}
                    id={"minimumPoints" + props.challenge._id}
                  >
                    {props.challenge.minimumPoints}
                  </p>
                </>
              ) : (
                <p
                  style={{
                    display: "none",
                  }}
                  id={"minimumPoints" + props.challenge._id}
                >
                  {props.challenge.minimumPoints}
                </p>
              )}

              <label>Flag:</label>
              <p
                contentEditable="true"
                style={{
                  backgroundColor: "rgb(30, 32, 55)",
                  outline: "none",
                }}
                id={"flag" + props.challenge._id}
              >
                {props.challenge.flag}
              </p>

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
                    props.saveChallenge(props.challenge);
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
                      data: props.challenge,
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
  );
}

export default ChallengeCard;
