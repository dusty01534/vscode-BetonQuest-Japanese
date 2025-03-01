import React from "react";

import Event from "betonquest-utils/betonquest/Event";
import EventsEditor from "./EventsList/EventsEditor";
import CommonList, { BaseListProps } from "./CommonList";

export default function eventsList(props: BaseListProps) {

    return (
        <CommonList<Event> {...props} type='events' editor={EventsEditor} />
    );
}