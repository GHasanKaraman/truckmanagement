import { useState } from "react";
import { Form, Button, Select, Input, ConfigProvider, Result } from "antd";

import "./qrIssues.css";
import {
  getQRProblemsBySuperior,
  closeQRIssue,
} from "../../controllers/issuesController";
import { useNavigate } from "react-router-dom";

const IssueClosingForm = (props) => {
  const [showResult, setShowResult] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [disabledProblem, setDisabledProblem] = useState(true);
  const [problems, setProblems] = useState([]);

  const loadProblems = async (superiorID) => {
    const problems = await getQRProblemsBySuperior(superiorID);
    setProblems(problems);
  };
  if (!showResult) {
    return (
      <div>
        <div
          style={{
            padding: "10px",
            fontSize: "1.5rem",
            fontWeight: "600",
            color: "#2e7538",
          }}
        >
          Issue Closing Form
        </div>
        <ConfigProvider
          theme={{
            components: {
              Checkbox: {
                colorPrimary: "#2e7538",
                colorPrimaryHover: "#245b2c",
              },
              Button: {
                colorPrimary: "#2e7538",
                colorPrimaryHover: "#245b2c",
              },
              Radio: {
                colorPrimary: "#2e7538",
              },
              Select: {
                colorPrimary: "#2e7538",
                colorPrimaryHover: "#245b2c",
              },
            },
          }}
        >
          <Form
            name="issue-form"
            form={form}
            layout="vertical"
            onFinish={async (values) => {
              const result = await closeQRIssue(values, props.targetID);
              setShowResult(true);
            }}
          >
            <Form.Item
              name="superior"
              label="Problematic machine part"
              rules={[
                {
                  required: true,
                  message: "Please select the superior problem!",
                },
              ]}
            >
              <Select
                showSearch
                placeholder="Superior"
                options={props.superiors.map((item) => {
                  return { value: item.superior, id: item._id };
                })}
                onChange={(_, e) => {
                  loadProblems(e.id);
                  setDisabledProblem(false);
                  form.setFieldsValue({ problem: null });
                }}
              ></Select>
            </Form.Item>

            <Form.Item
              name="problem"
              label="What is the problem?"
              rules={[
                {
                  required: true,
                  message: "Please select the problem!",
                },
              ]}
            >
              <Select
                disabled={disabledProblem}
                showSearch
                placeholder="Problem"
                options={problems.map((item) => {
                  return { value: item.problem };
                })}
              ></Select>
            </Form.Item>

            <Form.Item
              name="fixingMethod"
              label="How you fixed?"
              rules={[
                {
                  required: true,
                  message: "Please select the fixing method!",
                },
              ]}
            >
              <Select
                showSearch
                placeholder="Fixing Method"
                options={props.fixingMethods.map((item) => {
                  return { value: item.fixingMethod };
                })}
              ></Select>
            </Form.Item>

            <Form.Item name="comment" label="What is your comment?">
              <Input.TextArea
                rows={4}
                showCount
                placeholder="Comment"
                maxLength={200}
              />
            </Form.Item>
            <Form.Item shouldUpdate>
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  width: "100%",
                }}
              >
                Stop
              </Button>
            </Form.Item>
          </Form>
        </ConfigProvider>
      </div>
    );
  } else {
    return (
      <Result
        status="success"
        title="Issue has been closed successfully!"
      ></Result>
    );
  }
};

export default IssueClosingForm;
