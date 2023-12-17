import React, { useEffect, useState } from "react";
import { Select } from "antd";

import { InputProps } from "./Common";
import ENTITY_TYPE_LIST from "../../../../../../bukkit/Data/EntityTypeList";

const bukkitOptions = ENTITY_TYPE_LIST.map(e => {
    return {
        value: e.getBukkitId(),
        label: e.getBukkitId() // TODO: i18n
    };
});

export default function (props: InputProps) {
    const [options, setOptions] = useState(bukkitOptions);
    const [value, setValue] = useState(props.value as string);
    useEffect(() => {
        setValue(props.value);
    }, [props.value]);

    console.log("a");

    return (
        <Select
            value={value}
            // defaultValue={props.value}
            defaultActiveFirstOption={false}
            // onSelect={(e) => {
            //     props.onChange(e);
            // }}
            onChange={(e) => {
                props.onChange(e);
            }}
            options={options}
            showSearch
            onSearch={searchString => {
                if (
                    searchString.length > 0
                    // Allow normal EntityType syntax, or RegExp
                    && searchString.match(/^[a-z0-9_\[\]\{\}\(\)\?\:\=\!\.\*\+\<\>\^\$\\]+$/mi)
                    && !bukkitOptions.some(e => e.label === searchString.toUpperCase())
                ) {
                    try {
                        new RegExp(searchString, 'mi'); // test if it could build RegExp
                        setOptions([{ value: searchString, label: searchString }, ...bukkitOptions]);
                    } catch { }
                } else {
                    setOptions(bukkitOptions);
                }
            }}
            filterOption={(input, option) => {
                try {
                    input += (input.endsWith(']') && !input.endsWith('[]')) ? '[]' : '';
                    const regexp = new RegExp(input, 'mi');
                    return option?.label ? regexp.test(option.value) || regexp.test(option.label) : false;
                } catch {
                    return false;
                }
            }}
            notFoundContent={null}
            popupMatchSelectWidth={false}
            placeholder={props.placeholder}
            size="small"
            style={{ width: '100%' }}
        />
    );
}