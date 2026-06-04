import {
 createContext,
 useContext
} from "react";

export const ConferenceContext =
createContext(null);

export const useConference = () =>
useContext(ConferenceContext);