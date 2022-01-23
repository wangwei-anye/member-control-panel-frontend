import React from 'react';
import { DatePicker } from 'antd';

const { RangePicker } = DatePicker;

export class CustomRangePicker extends RangePicker {
  handleChange = () => {}
}
