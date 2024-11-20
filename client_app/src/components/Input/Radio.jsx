import React from 'react';
import ReactDOM from 'react-dom';
import { Formik, Form, useField } from 'formik';
import * as Yup from 'yup';
import Icon from '../Icon/index.tsx';
import { values } from 'lodash';

const MyTextInput = ({
  label,
  icons,
  hasTextareaHeight,
  labelFor,
  options,
  type = '',
  ...props
}) => {
  // useField() returns [formik.getFieldProps(), formik.getFieldMeta()]
  // which we can spread on <input>. We can use field meta to show an error
  // message if the field is invalid and it has been touched (i.e. visited)
  const [field, meta] = useField(props);

  let controlClassName = [
    'px-3 py-2 max-w-full border-gray-700 rounded w-full dark:placeholder-gray-400',
    meta.touched && meta.error
      ? 'px-3 py-2 max-w-full border-2 border-red-600 rounded w-full dark:placeholder-red-600'
      : '',
    'focus:ring focus:ring-blue-600 focus:border-blue-600 focus:outline-none',
    props.hasTextareaHeight ? 'h-24' : 'h-12',
    props.isBorderless ? 'border-0' : 'border',
    props.isTransparent ? 'bg-transparent' : 'bg-white dark:bg-slate-800',

    ''
  ].join(' ');


  console.log(Array.isArray(meta.value))
  // console.log({ values: meta.value })
  return (
    <>
      <div
        className={
          meta.touched && meta.error
            ? `border-solid border-2 border-red-500`
            : ``
        }>
        {label && (
          <label
            className={`block mb-2 border-gray-700 text-left font-bold ${labelFor ? 'cursor-pointer' : ''
              }`}>
            {label}
          </label>
        )}
        {/* border-solid border-2 border-red-500 */}
        {options.map(({ label, value }) => {
          let parsedValue;

          try {
            parsedValue = JSON.parse(meta.value || ""); // Try parsing the value
          } catch (error) {
            parsedValue = meta.value; // If invalid, return the original string
          }

          return (
            <div className="inline-flex items-center mr-4 ">

              <label className="label cursor-pointer">
                <input
                  type="checkbox"
                  className="checked:bg-blue-500"
                  {...field}
                  {...props}
                  // checked={meta.value === value}
                  //  checked={Array.isArray(meta.value) && meta.value.includes(value)}

                  //  type={Array.isArray(meta.value) ? "checkbox" : "radio"}
                  checked={
                    Array.isArray(parsedValue)
                      ? meta.value.includes(value) // For checkboxes
                      : meta.value === value      // For radio buttons
                  }

                  value={value}
                  // onChange={() => {
                  //   props.setFieldValue(field.name, value);
                  // }}

                  onChange={(e) => {


                    let selected = meta.value;


                    if (type !== 'radio') {
                      if (e.target.checked) {
                        console.log({ value })
                        selected.push(value);
                      } else {
                        const index = selected.indexOf(value);
                        if (index > -1) {
                          selected.splice(index, 1); // Remove value if unchecked
                        }

                        console.log({ selected })
                      }
                    } else {
                      selected = value;
                    }

                    console.log({ selected })

                    props.setFieldValue(field.name, selected);
                  }}
                />
                <span className="label-text ml-2">{label}</span>
              </label>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default MyTextInput;
