import { Form, Button, Checkbox, Row, Col, Space, ConfigProvider } from "antd";

import "./qrIssues.css";
import { createQRIssue } from "../../controllers/issuesController";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const IssueOpeningForm = (props) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
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
        Issue Opening Form
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
            console.log(values);
            /*const result = await createQRIssue(values, props.targetID);
            if (result == 1) {
              navigate(0);
            }*/
          }}
        >
          <Form.Item
            style={{ fontSize: "20px" }}
            name="technicians"
            label="What is your name?"
            rules={[
              {
                required: true,
                message: "Please select the technicians!",
              },
            ]}
          >
            <Checkbox.Group>
              <Col>
                <Space direction="vertical" size={15}>
                  {props.technicians.map((technician) => {
                    return (
                      <Row>
                        <Checkbox value={technician.name}>
                          {technician.name}
                        </Checkbox>
                      </Row>
                    );
                  })}
                </Space>
              </Col>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item shouldUpdate>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                width: "100%",
              }}
            >
              Start
            </Button>
          </Form.Item>
        </Form>
      </ConfigProvider>
    </div>
  );
};

export default IssueOpeningForm;
