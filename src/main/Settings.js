import React from 'react'
import { Button, Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import { toggleShowing } from '../redux/actions'
import BootstrapTable from 'react-bootstrap-table-next';
import {AiOutlineDelete} from 'react-icons/ai'

import * as R from 'ramda'

const columns = [{
    dataField: 'id',
    text: 'ID'
}, {
    dataField: 'title',
    text: 'Title'
}, {
    dataField: 'url',
    text: 'URL'
},
{
    dataField: 'link',
    text: 'Link',
    align: 'center',
    editable: false,
    formatter: linkFormatter,
  },


];

function linkFormatter(cell, row) {

        return (
            <>
           <Button variant="secondary" target="_blank" rel="noopener noreferrer"><AiOutlineDelete size={20}/></Button>
           </>
         );

}




const Settings = ({ windows, settings, toggleShowing }) => {

    const handleClose = () => toggleShowing(false);
    return (
        <>

            <Modal
                show={settings.showing}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
                size="lg"
                variant="secondary"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Settings</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <BootstrapTable
                        keyField="id"
                        data={windows}
                        columns={columns}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
            </Button>
                    <Button variant="primary">Save</Button>
                </Modal.Footer>
            </Modal>
        </>

    )

}

const mapStateToProps = state => {
    const windows = R.prop("windows", state)
    if(R.isNil(windows)){
        return
    }
    const win_array = R.compose(
        R.values,
        R.map((item) => {return item})
       )(windows)
    
    return R.assoc("windows", win_array, state)
};

export default connect(
    mapStateToProps,
    { toggleShowing }
)(Settings)