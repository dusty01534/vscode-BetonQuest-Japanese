import React, { useContext, useEffect, useRef, useState } from "react";

import { Button, Collapse, CollapseProps, Input } from "antd";
import { ItemType } from "rc-collapse/es/interface";
import { VscChevronRight } from "react-icons/vsc";

import L from "betonquest-utils/i18n/i18n";
import List from "betonquest-utils/betonquest/List";
import ListElement, { ListElementType } from "betonquest-utils/betonquest/ListElement";
import CollapseLabel from "./CommonList/CollapseLabel";
import CollapseExtra from "./CommonList/CollapseExtra";
import { ListElementEditorProps } from "./CommonList/CommonEditor";
import { YamlPathPointer } from "betonquest-utils/yaml/yamlPathPointer";

export interface BaseListProps<T extends ListElement> {
    list: List<T>,
    syncYaml: Function,
}

export interface ListEditorProps<T extends ListElement> {
    type: ListElementType,

    editor: (props: ListElementEditorProps<T>) => React.JSX.Element,
}

export interface CommonListProps<T extends ListElement> extends ListEditorProps<T>, BaseListProps<T> {}

export default function <T extends ListElement>(props: CommonListProps<T>) {

    // // UI update trigger #1
    // const [getTrigger, setTrigger] = useState(false);
    // const refreshUI = () => {
    //     setTrigger(!getTrigger);
    // };

    // Cache all ListElements
    const [listElements, _setListElements] = useState<T[]>([]);
    const listElementsCache = useRef(listElements);
    const setListElements = (newListElements: T[]) => {
        listElementsCache.current = newListElements;
        _setListElements(newListElements);
    };

    // Convert all ListElements into coresponding ListElement's Editor
    const getListElementEditor = (e: T): ItemType => {
        const name = e.getName();
        return {
            key: name,
            label: <CollapseLabel {...props} listElement={e} onListElementRemane={onElementRemane}></CollapseLabel>,
            children: <props.editor key={name} {...props} listElement={e}></props.editor>,
            style: { padding: "4px 0 0 0", wordBreak: "break-word" },
            extra: <CollapseExtra {...props} listElement={e} removeElement={onElementRemove} />
        };
    };
    const getListElementEditorList = (allElements: T[]): CollapseProps['items'] => {
        return allElements.map(e => {
            return getListElementEditor(e);
        });
    };

    // Cache all ListElements' Editor
    const [listElementEditorList, _setListElementEditorList] = useState<CollapseProps['items']>([]);
    const listElementEditorListCache = useRef(listElementEditorList);
    const setListElementEditorList = (newListElementEditorList: CollapseProps['items']) => {
        listElementEditorListCache.current = newListElementEditorList;
        _setListElementEditorList(newListElementEditorList);
    };

    useEffect(() => {
        const newListElements = props.list.getAllListElements();
        setListElements(newListElements);
        setListElementEditorList(getListElementEditorList(newListElements));
    }, [props.list]);

    // Handle Collapse
    const [collapseActiveKeys, setCollapseActiveKeys] = useState<string | string[]>([]);
    // Method to open a collapse
    const onCollapseExpand = (key: string) => {
        if (typeof collapseActiveKeys === 'string') {
            if (collapseActiveKeys !== key) {
                setCollapseActiveKeys([collapseActiveKeys, key]);
            }
        } else {
            if (!collapseActiveKeys.find(e => e === key)) {
                setCollapseActiveKeys([...collapseActiveKeys, key]);
            }
        }
    };
    // Method to close a collapse
    const onCollapseCollapse = (key: string) => {
        if (typeof collapseActiveKeys === 'string') {
            if (collapseActiveKeys === key) {
                setCollapseActiveKeys([]);
            }
        } else {
            if (collapseActiveKeys.find(e => e === key)) {
                setCollapseActiveKeys(collapseActiveKeys.filter(e => e !== key));
            }
        }
    };

    // Handle search
    const onElementSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length > 0) {
            try {
                const pattern = new RegExp(e.target.value, 'i');
                const filteredElements = listElements.filter(element => {
                    return element.getName().match(pattern) || element.toString().match(pattern);
                });
                setListElementEditorList(getListElementEditorList(filteredElements));
            } catch (e) {
                // Handle regex pattern error
                setListElementEditorList([]);
            }
        } else {
            setListElementEditorList(getListElementEditorList(listElements));
        }
    };

    // Handle add
    const onElementAdd = () => {
        _onElementAdd.current!();
    };
    const _onElementAdd = useRef<() => void>();
    useEffect(() => {
        _onElementAdd.current = () => {
            // Get incremental ID
            let id = 1;
            while (listElements.some(e => e.getName() === props.type + '_' + id)) {
                id++;
            }

            // Create
            const newListElement = props.list.createListElement(props.type + '_' + id);
            const newListElements = [...listElements, newListElement];
            // Append to cached listElements
            setListElements(newListElements);
            // Create new editor
            const newListElementEditor = getListElementEditor(newListElement);
            // Append new editor to elementEditorList
            setListElementEditorList(listElementEditorListCache.current?.concat(newListElementEditor));
            // Expand editor
            onCollapseExpand(newListElement.getName());
            props.syncYaml();
        };
    }, [listElements, collapseActiveKeys]);

    // Handle remove
    const onElementRemove = (type: ListElementType, name: string) => {
        _onElementRemove.current!(type, name);
    };
    const _onElementRemove = useRef<(type: ListElementType, name: string) => void>();
    useEffect(() => {
        _onElementRemove.current = (type: ListElementType, name: string) => {
            // Remove from cached listElements
            const newListElements = listElementsCache.current.filter(e => e.getName() !== name);
            setListElements(newListElements);
            // Remove from elementEditorList
            const newListElementEditorList = listElementEditorListCache.current?.filter(e => e.key !== name);
            setListElementEditorList(newListElementEditorList);
            // Remove from expanded collapse keys
            onCollapseCollapse(name);

            // Remove from package
            props.list.removeListElement(name);
            props.syncYaml();
        };
    }, [collapseActiveKeys]);

    // Handle rename / change key
    const onElementRemane = (oldName: string, newName: string) => {
        _onElementRemane.current!(oldName, newName);
    };
    const _onElementRemane = useRef<(oldName: string, newName: string) => void>();
    useEffect(() => {
        _onElementRemane.current = (oldName: string, newName: string) => {
            // Update key on elementEditorList
            const newListElementEditorList = listElementEditorListCache.current?.map(e => {
                if (e.key === oldName) {
                    e.key = newName;
                }
                return e;
            });
            setListElementEditorList(newListElementEditorList);

            // Update expanded collapse keys
            if (typeof collapseActiveKeys === 'string' && collapseActiveKeys === oldName) {
                setCollapseActiveKeys([newName]);
            } else {
                setCollapseActiveKeys((collapseActiveKeys as string[]).map(e => {
                    if (e === oldName) {
                        return newName;
                    }
                    return e;
                }));
            }
        };
    }, [collapseActiveKeys]);

    // Get and update Yaml Path Pointer
    const { setDocumentPathPointer, editorPathPointer } = useContext(YamlPathPointer);
    useEffect(() => {
        if (editorPathPointer.length < 1) {
            return;
        };
        const name = editorPathPointer[0];
        onCollapseExpand(name);
    }, [editorPathPointer]);

    return (
        <>
            <Input
                placeholder={L("*.commonList.search")}
                size="small"
                style={{
                    margin: "8px",
                    width: "-webkit-fill-available",
                }}
                onChange={onElementSearch}
                allowClear
            ></Input>
            <div
                style={{
                    overflowX: "hidden",
                    overflowY: "auto",
                    height: "inherit"
                }}
            >
                <Collapse
                    // accordion
                    expandIcon={({ isActive }) => <VscChevronRight style={{ marginLeft: "8px", transform: isActive ? 'rotate(90deg)' : undefined }} />}
                    items={listElementEditorList}
                    // ghost={true}
                    // bordered={false}
                    activeKey={collapseActiveKeys}
                    onChange={key => {
                        setCollapseActiveKeys(key);
                        // Jump to code
                        if (typeof key === 'string') {
                            setDocumentPathPointer([key]);
                        } else {
                            const difference = key.filter(e => !collapseActiveKeys.includes(e));
                            if (difference.length > 0) {
                                setDocumentPathPointer([difference[difference.length - 1]]);
                            }
                        }
                    }}
                    destroyInactivePanel={true}
                ></Collapse>
                <Button
                    type="primary"
                    onClick={onElementAdd}
                    style={{
                        margin: "24px 20px",
                        width: "-webkit-fill-available",
                    }}
                >
                    {L("*.commonList.new")}
                </Button>
            </div>
        </>
    );
}