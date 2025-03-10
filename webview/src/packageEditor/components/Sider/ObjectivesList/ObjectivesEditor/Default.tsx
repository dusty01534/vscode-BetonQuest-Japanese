import React, { useEffect, useRef, useState } from "react";
import { Col, Divider, Row, Tooltip } from "antd";
import { VscQuestion } from "react-icons/vsc";
import { TbVariableOff, TbVariablePlus } from "react-icons/tb";

import L from "betonquest-utils/i18n/i18n";
import Objective from "betonquest-utils/betonquest/Objective";
import { ListElementEditorBodyProps } from "../../CommonList/CommonEditor";
import { MandatoryArgumentDataType, OptionalArgumentDataType } from "betonquest-utils/betonquest/Arguments";
import Variable from "../../CommonList/Input/Variable";

const colSpanLeft1 = 10;
const colSpanRight1 = 14;
const colSpanLeft2 = 8;
const colSpanRight2 = 16;
const colSpanLeft3 = 6;
const colSpanRight3 = 18;

export default function (props: ListElementEditorBodyProps<Objective>) {

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

    // Arguments should be parsed everytime. Do NOT cache it.
    const args = props.listElement.getArguments(props.argumentsPattern);

    // Auto re-arange cells
    const parentRef = useRef<HTMLDivElement>(null);
    const [spanL, setSpanL] = useState(colSpanLeft1);
    const [spanR, setSpanR] = useState(colSpanRight1);
    useEffect(() => {
        new ResizeObserver(() => {
            const width = parentRef.current?.getBoundingClientRect().width;
            if (width) {
                if (width < 320) {
                    setSpanL(24);
                    setSpanR(24);
                } else if (width < 480) {
                    setSpanL(colSpanLeft1);
                    setSpanR(colSpanRight1);
                } else if (width < 640) {
                    setSpanL(colSpanLeft2);
                    setSpanR(colSpanRight2);
                } else {
                    setSpanL(colSpanLeft3);
                    setSpanR(colSpanRight3);
                }
            }
        }).observe(parentRef.current as Element);
    }, []);

    // Variable switching
    const [variableEnabled, setVariableEnabled] = useState<Map<number | string, boolean>>(new Map());
    useEffect(() => {
        const map = new Map<number | string, boolean>();
        for (let i = 0; i < props.argumentsPattern.mandatory.length; i++) {
            map.set(i, args.getMandatoryArgument(i).getType() === 'variable');
        }
        if (props.argumentsPattern.optional) {
            for (let i = 0; i < props.argumentsPattern.optional.length; i++) {
                const key = props.argumentsPattern.optional[i].key;
                map.set(key, args.getOptionalArgument(key)?.getType() === 'variable');
            }
        }
        setVariableEnabled(map);
    }, [props.listElement.toString()]);

    return (
        <div ref={parentRef}>
            {(props.argumentsPattern.mandatory.length > 0 && props.argumentsPattern.optional) &&
                <Divider orientation="center" plain>
                    <u>{L("*.commonList.editor.default.mandatoryArguments")}</u>
                </Divider>
            }
            {props.argumentsPattern.mandatory.map((pat, index) => {
                const arg = args.getMandatoryArgument(index);
                const argValue = arg.getValue();
                return (
                    <Row justify="space-between" gutter={[0, 4]} style={{ padding: "0 8px 16px 8px" }} key={index}>
                        <Col span={spanL}>
                            <div>
                                {pat.name}&nbsp;
                                {pat.tooltip && <>
                                    <sup>
                                        <Tooltip title={<span>{pat.tooltip}</span>}>
                                            <VscQuestion />
                                        </Tooltip>
                                    </sup>&nbsp;
                                </>}
                            </div>
                            {pat.allowVariable && <Tooltip title={L("*.commonList.editor.default.toggleVariableTooltip")} placement="bottom">
                                <span
                                    onClick={() => {
                                        if (variableEnabled.get(index)) {
                                            variableEnabled.set(index, false);
                                            args.setMandatoryArgument(index, props.argumentsPattern.mandatory[index].defaultValue);
                                        } else {
                                            variableEnabled.set(index, true);
                                            args.setMandatoryArgument(index, "%%");
                                        }
                                        props.syncYaml();
                                        refreshUI();
                                    }}
                                    style={{ padding: 0, border: "1px solid var(--vscode-checkbox-border)" }}
                                >
                                    {variableEnabled.get(index) ? <TbVariableOff /> : <TbVariablePlus />}
                                </span>
                            </Tooltip>}
                        </Col>
                        <Col span={spanR}>
                            {pat.jsx && (pat.allowVariable && variableEnabled.get(index) &&
                                <Variable
                                    placeholder={L("*.commonList.editor.default.toggleVariablePlaceholder")}
                                    value={arg.getType() === 'variable' ? argValue as string : "%%"}
                                    onChange={(str) => {
                                        args.setMandatoryArgument(index, str);
                                        props.syncYaml();
                                        refreshUI(); // Refresh states, if component uses useEffect() inside
                                    }}
                                />
                                ||
                                <pat.jsx
                                    value={argValue}
                                    defaultValue={pat.defaultValue}
                                    placeholder={pat.placeholder}
                                    onChange={(value: MandatoryArgumentDataType) => {
                                        args.setMandatoryArgument(index, value);
                                        props.syncYaml();
                                        refreshUI(); // Refresh states, if component uses useEffect() inside
                                    }}
                                    config={pat.config}
                                />
                            )}
                        </Col>
                    </Row>
                );
            })}
            {props.argumentsPattern.optional &&
                <>
                    <Divider orientation="center" plain>
                        <u>{L("*.commonList.editor.default.optionalArguments")}</u>
                    </Divider>
                    {props.argumentsPattern.optional?.map((pat, index) => {
                        const arg = args.getOptionalArgument(pat.key);
                        const argValue = arg?.getValue();
                        return (
                            <Row justify="space-between" gutter={[0, 4]} style={{ padding: "0 8px 16px 8px" }} key={index}>
                                <Col span={spanL}>
                                    <div>{pat.name}&nbsp;
                                        {pat.tooltip && <>
                                            <sup>
                                                <Tooltip title={<span>{pat.tooltip}</span>}>
                                                    <VscQuestion />
                                                </Tooltip>
                                            </sup>&nbsp;
                                        </>}
                                    </div>
                                    {pat.allowVariable && <Tooltip title={L("*.commonList.editor.default.toggleVariableTooltip")} placement="bottom">
                                        <span
                                            onClick={() => {
                                                if (variableEnabled.get(pat.key)) {
                                                    variableEnabled.set(pat.key, false);
                                                    args.setOptionalArgument(pat.key, undefined);
                                                } else {
                                                    variableEnabled.set(pat.key, true);
                                                    args.setOptionalArgument(pat.key, "%%");
                                                }
                                                props.syncYaml();
                                                refreshUI();
                                            }}
                                            style={{ padding: 0, border: "1px solid var(--vscode-checkbox-border)" }}
                                        >
                                            {variableEnabled.get(pat.key) ? <TbVariableOff /> : <TbVariablePlus />}
                                        </span>
                                    </Tooltip>}
                                </Col>
                                <Col span={spanR}>
                                    {pat.jsx && (pat.allowVariable && variableEnabled.get(pat.key) &&
                                        <Variable
                                            placeholder={L("*.commonList.editor.default.toggleVariablePlaceholder")}
                                            value={arg?.getType() === 'variable' ? argValue as string : "%%"}
                                            onChange={(str) => {
                                                args.setOptionalArgument(pat.key, str);
                                                props.syncYaml();
                                                refreshUI(); // Refresh states, if component uses useEffect() inside
                                            }}
                                        />
                                        ||
                                        <pat.jsx
                                            value={argValue}
                                            placeholder={pat.placeholder}
                                            onChange={(value: OptionalArgumentDataType) => {
                                                args.setOptionalArgument(pat.key, value);
                                                props.syncYaml();
                                                refreshUI(); // Refresh states, if component uses useEffect() inside
                                            }}
                                            config={pat.config}
                                        />
                                    )}
                                </Col>
                            </Row>
                        );
                    })}
                </>
            }
        </div>
    );
}