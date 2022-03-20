import { createReducer } from "@ngrx/store";
import { initialState } from "../store/initial.state";

export const mainReducer = createReducer(initialState);
