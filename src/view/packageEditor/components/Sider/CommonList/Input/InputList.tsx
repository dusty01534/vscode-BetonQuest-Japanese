import React, { useEffect, useState } from "react";
import { Input } from "antd";
import { VscClose } from "react-icons/vsc";

import { InputProps } from "./Common";

export default function (props: InputProps) {
    // UI update trigger
    const [getTrigger, setTrigger] = useState(false);
    const refreshUI = () => {
        setTrigger(!getTrigger);
    };

    const [valueArray, setValueArray] = useState(props.value as string[] || [""]);
    useEffect(() => {
        setValueArray(props.value as string[] || [""]);
    }, [props.value]);

    return (
        <>
            {valueArray.map((value, index) =>
                <Input
                    key={index}
                    value={value}
                    onChange={(e) => {
                        const valueUpdate = valueArray;
                        valueUpdate[index] = e.target.value;
                        setValueArray(valueUpdate);
                        props.onChange(valueUpdate);
                        refreshUI();
                    }}
                    placeholder={props.placeholder}
                    onPressEnter={() => {
                        const valueUpdate = [...valueArray.slice(0, index + 1), "", ...valueArray.slice(index + 1)];
                        setValueArray(valueUpdate);
                        props.onChange(valueUpdate);
                        refreshUI();
                    }}
                    size="small"
                    style={index > 0 ? { marginTop: 4 } : undefined}
                    suffix={
                        valueArray.length > 1 ? <VscClose
                            title="Remove"
                            onClick={() => {
                                const valueUpdate = [...valueArray.slice(0, index), ...valueArray.slice(index + 1)];
                                setValueArray(valueUpdate);
                                props.onChange(valueUpdate);
                                refreshUI();
                            }}
                        /> : <span />
                    }
                />
            )}
        </>
    );
}