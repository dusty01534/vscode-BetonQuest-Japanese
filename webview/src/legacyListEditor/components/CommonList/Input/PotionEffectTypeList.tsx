import React, { useEffect, useState } from "react";
import { Button, Select, Space } from "antd";
import { VscClose } from "react-icons/vsc";

import L from "betonquest-utils/i18n/i18n";
import { InputProps } from "./Common";
import POTION_EFFECT_TYPE_LIST from "betonquest-utils/bukkit/Data/PotionEffectTypeList";
import { DefaultOptionType } from "antd/es/select";

const bukkitOptions = POTION_EFFECT_TYPE_LIST.map(e => {
    return {
        label: e.getBukkitId(), // TODO: i18n
        value: e.getBukkitId()
    } as {
        label: string;
        value: string;
    } & DefaultOptionType;
});


/**
 * Input for Enchantment and Level.
 * 
 * - `value` - [Enchantment, level][]: [string, number][]
 * - `defaultValue` - default values
 * - `placeholder` - single enchantment + level, [[Enchantment, level]
 * - `config`:
 *   - `allowEmpty` - Boolean, allow remove all entries / no default value.
 * @param props 
 * @returns 
 */
export default function (props: InputProps) {
    const [valueArray, setValueArray] = useState(props.value as string[] || props.defaultValue);
    useEffect(() => {
        setValueArray(props.value as string[] || props.defaultValue);
        updateDisabled(props.value as string[]);
    }, [props.value]);

    const [options, setOptions] = useState(bukkitOptions);

    const [focusIndex, setFocusIndex] = useState<number>(-1);

    // Disable selected options from the available list
    const updateDisabled = (valueUpdate: string[]) => {
        setOptions(bukkitOptions.map(option => {
            if (valueUpdate.some(v => v.toUpperCase() === option.value)) {
                option.disabled = true;
            } else {
                option.disabled = undefined;
            }
            return option;
        }));
    };

    const onChange = (value: string, index: number) => {
        // Update value
        const valueUpdate = valueArray.slice();
        valueUpdate[index] = value;
        // setValueArray(valueUpdate);
        props.onChange(valueUpdate);

        // Disable selected options from the available list
        updateDisabled(valueUpdate);
    };

    const onSearch = (searchString: string) => {
        if (
            searchString.length > 0
            && !bukkitOptions.some(e => e.label === searchString.toUpperCase())
        ) {
            setOptions([{ value: searchString, label: searchString }, ...bukkitOptions]);
        } else {
            setOptions(bukkitOptions);
        }
    };

    const onFilterOption = (input: string, option: { label: string, value: string } | undefined) => {
        try {
            const regexp = new RegExp(input, 'mi');
            return option?.label ? regexp.test(option.value) || regexp.test(option.label) : false;
        } catch {
            return false;
        }
    };

    const onRemove = (index: number) => {
        // Update value
        const valueUpdate = [...valueArray.slice(0, index), ...valueArray.slice(index + 1)];
        setValueArray(valueUpdate);
        props.onChange(valueUpdate);

        // Disable selected options from the available list
        updateDisabled(valueUpdate);
    };

    const onAdd = () => {
        const valueUpdate = valueArray.slice();

        // Do not allow adding new empty value if there is already one
        if (valueUpdate.length > 0 && valueUpdate.some(v => v.length === 0)) {
            setFocusIndex(valueUpdate.findIndex(v => v.length === 0));
            return;
        }

        // Update value
        valueUpdate.push("");
        setFocusIndex(valueUpdate.length - 1);
        setValueArray(valueUpdate);
        props.onChange(valueUpdate);

        // Disable selected options from the available list
        updateDisabled(valueUpdate);
    };

    return (
        <Space
            direction="vertical"
            size={4}
            style={{ width: '-webkit-fill-available' }}
        >
            {valueArray.map((value, index) =>
                <Space.Compact
                    key={index}
                    style={{ width: '-webkit-fill-available' }}
                >
                    <Select
                        value={value.toUpperCase()}
                        defaultActiveFirstOption={false}
                        onChange={e => onChange(e, index)}
                        options={options}
                        showSearch
                        onSearch={onSearch}
                        filterOption={onFilterOption}
                        notFoundContent={null}
                        popupMatchSelectWidth={false}
                        placeholder={props.placeholder}
                        autoFocus={index === focusIndex}
                        open={index === focusIndex}
                        onFocus={() => setFocusIndex(index)}
                        onBlur={() => setFocusIndex(-1)}
                        onSelect={() => setFocusIndex(-1)}
                        size="small"
                        style={{ width: '100%' }}
                    />
                    {(props.config?.allowEmpty || valueArray.length > 1) && <Button
                        style={{ height: 'inherit', background: 'none' }}
                        type="default"
                        size="small"
                        onClick={() => onRemove(index)}
                    >
                        <VscClose style={{ verticalAlign: 'middle' }} />
                    </Button>}
                </Space.Compact>
            )}
            <Button
                type="primary"
                size="small"
                onClick={onAdd}
            >
                {L("betonquest.*.input.potionEffectType*.add")}
            </Button>
        </Space>
    );
}