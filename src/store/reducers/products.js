import * as actionTypes from '../actions/actionsTypes';
import {updatedObject } from '../utility';


const initialState = {
    productRequested: {},
    productRequestedId: '',
    editingMode: false
}


const reducer = (state = initialState, action) => {
    switch(action.type){
        case actionTypes.SET_REQUESTED_PRODUCT : return updatedObject(state, {productRequested: action.product});
        case actionTypes.SET_REQUESTED_PRODUCT_ID: return updatedObject(state, {productRequestedId: action.id});
        case actionTypes.TOGGLE_EDITING_MODE: return updatedObject(state, {editingMode: !state.editingMode})

        default: return state
    }
}


export default reducer;