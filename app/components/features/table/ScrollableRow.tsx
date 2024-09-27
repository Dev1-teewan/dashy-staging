import { createStyles } from "antd-style";

const useStyle = createStyles(({ css }) => {
  const antCls = "ant"; // Custom Ant Design class prefix
  return {
    customTable: css`
      ${antCls}-table {
        ${antCls}-table-container {
          /* Ensure only vertical scrolling */
          ${antCls}-table-body {
            max-height: 252px; /* Adjust the max height based on your vertical scroll prop */
            overflow-y: auto; /* Enable vertical scrolling */
            overflow-x: hidden; /* Prevent horizontal scrolling */
          }

          /* Optional: Customize scrollbar appearance */
          ${antCls}-table-body::-webkit-scrollbar {
            width: 8px; /* Adjust width for vertical scrollbar */
          }

          ${antCls}-table-body::-webkit-scrollbar-thumb {
            background-color: rgba(0, 0, 0, 0.3); /* Custom scrollbar color */
            border-radius: 10px;
          }
        }
      }
    `,
  };
});

export default useStyle;
