import React, { useEffect, useRef, useState } from "react";
import { Row, Col, Divider, Select } from "antd";

import ListElement from "../../../../../betonquest/ListElement";
import { BaseListProps } from "../CommonList";
import { ArgumentsPattern } from "../../../../../betonquest/Arguments";

import styles from "./CommonEditor.module.css";

export interface ListElementEditorProps<T extends ListElement> extends BaseListProps {
    listElement: T,
}

export interface ListElementEditorBodyProps<T extends ListElement> extends ListElementEditorProps<T> {
    argumentsPattern: ArgumentsPattern,
}

export type Kind<T extends ListElement> = {
    value: string,
    display: string,
    description: React.ReactNode,
    editorBody?: (props: ListElementEditorBodyProps<T>) => React.JSX.Element,
    argumentsPattern: ArgumentsPattern
};

interface CommonEditorProps<T extends ListElement> extends ListElementEditorProps<T> {
    kinds: Kind<T>[],
    defaultEditorBody: (props: ListElementEditorBodyProps<T>) => React.JSX.Element,
}

export default function <T extends ListElement>(props: CommonEditorProps<T>) {

    // UI update trigger #1
    const [getTrigger, setTrigger] = useState(false);
    const refreshUI = () => {
        setTrigger(!getTrigger);
    };

    // UI update trigger #2
    // const [listElement, setListElement] = useState(props.listElement);
    // useEffect(()=>{
    //     setListElement(props.listElement);
    // }, [props.listElement]);

    const optionsCache = useRef(props.kinds.slice(1).map(k => ({
        value: k.value,
        label: k.display,
    })));

    const [options, setOptions] = useState<{ label: string, value: string }[]>(optionsCache.current);
    useEffect(() => {
        setOptions(optionsCache.current);
    }, [props.kinds]);

    const onKindSearch = (input: string) => {
        const opt = optionsCache.current.slice();
        if (
            input.match(/^[a-zA-Z]+$/g) &&
            !options.some(e => e.value === input)
        ) {
            opt.unshift({
                value: input,
                label: input,
            });
        }
        setOptions(opt);
    };

    // Handle kind search
    const onKindFilter = (input: string, option: {
        value: string;
        label: string;
    } | undefined) => {
        try {
            const patten = new RegExp(input, 'i');
            return (
                option?.value.match(patten)
                || option?.label.match(patten)
            ) ? true : false;
        } catch (e) {
            // Handle regex patten error
            return false;
        }
    };

    // Find editor by kind
    const getEditorBody = (kind: string) => {
        const k = props.kinds.find(e => e.value === kind) || props.kinds.find(e => e.value === '*');

        // Create arguments' editor by kind.argumentsConfig
        return (<>
            {k?.description && <div style={{ padding: "0 8px 8px 8px" }}>{k.description}</div>}
            {k && (k.editorBody &&
                <k.editorBody {...props} argumentsPattern={k.argumentsPattern} />
                ||
                <props.defaultEditorBody {...props} argumentsPattern={k.argumentsPattern}></props.defaultEditorBody>)
            }
        </>);
    };

    return (
        <div style={{ padding: "0 8px" }}>
            <Row justify="space-between" style={{ padding: "8px 0" }}>
                <Col span={4}>
                    <span style={{ paddingLeft: "8px" }}>Kind:</span>
                </Col>
                <Col span={18}>
                    <Select
                        className={styles.select}
                        showSearch
                        defaultOpen={!props.listElement.getKind()}
                        autoFocus={!props.listElement.getKind()}
                        value={props.listElement.getKind() || undefined}
                        placeholder="(Please enter a kind)"
                        defaultActiveFirstOption={false}
                        // suffixIcon={null}
                        onChange={(e) => {
                            props.listElement.setKind(e);
                            props.syncYaml();
                            refreshUI();
                        }}
                        onSearch={onKindSearch}
                        filterOption={onKindFilter}
                        notFoundContent={null}
                        options={options}
                        size="small"
                        style={{ width: "100%" }}
                    />
                </Col>
            </Row>
            <Divider />
            {getEditorBody(props.listElement.getKind())}
        </div>
    );
}