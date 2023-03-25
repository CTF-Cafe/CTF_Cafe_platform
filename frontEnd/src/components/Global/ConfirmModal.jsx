function ConfirmModal(props) {

  return (
     <div
      className="modal fade"
      id="confirmModal"
      tabIndex="-1"
      role="dialog"
      aria-labelledby="confirmModalLabel"
      aria-hidden="true"
    >
     <div className="modal-dialog" role="document">
       <div className="modal-content">
         <div className="modal-header">
           <h5 className="modal-title" id="confirmModalLabel">
             Confirm action?
           </h5>
           <button
             type="button"
             className="close"
             data-dismiss="modal"
             aria-label="Close"
           >
             <span aria-hidden="true">&times;</span>
           </button>
         </div>
         <div className="modal-footer" style={{ justifyContent: "center" }}>
           <button type="button" className="btn btn-danger" data-dismiss="modal">
             Cancel
           </button>
           <button
             type="button"
             className="btn btn-success"
             data-dismiss="modal"
             onClick={() => {
              props.action.function(props.action.e, props.action.data);
             }}
           >
             Confirm
           </button>
         </div>
       </div>
     </div>
   </div>
  );
}

export default ConfirmModal;
