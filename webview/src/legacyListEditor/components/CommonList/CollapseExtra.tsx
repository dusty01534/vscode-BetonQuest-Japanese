import React, { useEffect, useState } from "react";
import { Popconfirm, Tooltip } from "antd";
import { VscTrash, VscWarning } from "react-icons/vsc";

import L from "betonquest-utils/i18n/i18n";
import { CommonListProps } from "../CommonList";
import ListElement, { ListElementType } from "betonquest-utils/betonquest/ListElement";

interface CollapseExtraProps<T extends ListElement> extends CommonListProps<T> {
    listElement: T,
    removeElement: (type: ListElementType, name: string) => void,
}

export default function <T extends ListElement>(props: CollapseExtraProps<T>) {

    const [name, setName] = useState("");

    // Handle remove
    const onElementRemove = () => {
        // Remove from parent collapse
        props.removeElement(props.type, props.listElement.getName());
    };

    return (
        <>
            <Popconfirm
                icon={
                    <VscWarning
                        style={{
                            color: "var(--vscode-notificationsWarningIcon-foreground)",
                            margin: "0 4px",
                        }}
                    />
                }
                onOpenChange={() => setName(props.listElement.getName())}
                onConfirm={onElementRemove}
                placement="topRight"
                title={L("legacyListEditor.commonList.collapseExtra.popconfirmTitle", [name])}
                okText={L("delete")}
                cancelText={L("cancel")}
                onPopupClick={e => e.stopPropagation()} // Prevent parent Collapse being toggled when clicked
            >
                <Tooltip placement="left" title={L("delete")}>
                    <VscTrash
                        style={{
                            margin: '0 6px 0 0',
                            color: 'var(--vscode-tab-inactiveForeground)',
                        }}
                        onClick={e => e.stopPropagation()} // Prevent parent Collapse being toggled when clicked
                    />
                </Tooltip>
            </Popconfirm>
        </>
    );
}