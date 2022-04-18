import React from "react";
import { Select } from "antd";
import { ListingsFilter } from "../../../../lib/graphql/globalTypes";

interface Props {
  filter: ListingsFilter;
  setFilter: (filter: ListingsFilter) => void;
}

const { Option } = Select;

export const ListingsFilters = ({ filter, setFilter }: Props) => {
  return (
    <div className="listings-filters">
      <span>Lọc theo</span>
      <Select value={filter} onChange={(filter: ListingsFilter) => setFilter(filter)}>
        <Option value={ListingsFilter.PRICE_LOW_TO_HIGH}>Giá: Thấp đến cao</Option>
        <Option value={ListingsFilter.PRICE_HIGH_TO_LOW}>Giá: Cao đến thấp</Option>
        <Option value={ListingsFilter.SALE_LOW_TO_HIGH}>Giảm giá: Thấp đến cao</Option>
        <Option value={ListingsFilter.SALE_HIGH_TO_LOW}>Giảm giá: Cao đến thấp</Option>
        <Option value={ListingsFilter.TYPE_APARTMENT}>Loại: Chung cư</Option>
        <Option value={ListingsFilter.TYPE_HOUSE}>Loại: Nhà</Option>
      </Select>
    </div>
  );
};
