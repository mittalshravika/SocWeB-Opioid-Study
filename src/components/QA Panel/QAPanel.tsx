import { Carousel, Card, Button } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import Question from "../Question/Question";
import styles from "./QAPanel.module.scss";
import { useAnalytics } from "../../analytics/AnalyticsProvider";
import { useEffect } from "react";
export default function QAPanel(props: {
  questions: any[];
  carouselRef: any;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  disabledForwardButton: boolean;
  changeDisabledForwardButton: React.Dispatch<React.SetStateAction<boolean>>;
  disabledBackButton: boolean;
  changeDisabledBackButton: React.Dispatch<React.SetStateAction<boolean>>;
  setShowQuizButton: React.Dispatch<React.SetStateAction<boolean>>;
  showQuizButton: boolean;
}) {
  const { changePageNumber, incrementQuestionTime, getPageNumber } =
    useAnalytics();

  // ==========================================
  // Section: Carousel Controls
  // ==========================================
  const goBack = () => {
    // if coming from the thank you page then set it equal to true else false
    if (getPageNumber() === props.questions.length + 1) {
      props.setShowQuizButton(true);
    } else if (props.showQuizButton) {
      props.setShowQuizButton(false);
    }

    // if the first page then don't do anything
    if (getPageNumber() === 0) {
      return;
    }

    changePageNumber("subtract");
    props.carouselRef!.current.prev();

    if (props.disabledForwardButton) {
      props.changeDisabledForwardButton(false);
    }

    // if first question, disable back button else enable if disabled
    if (getPageNumber() === 0) {
      props.changeDisabledBackButton(true);
    } else if (props.disabledBackButton) {
      props.changeDisabledBackButton(false);
    }
  };

  const goForward = () => {
    if (getPageNumber() === props.questions.length) {
      return;
    }
    if (getPageNumber() === props.questions.length - 1) {
      props.setShowQuizButton(true);
    }

    changePageNumber("add");

    props.carouselRef!.current.next();

    if (props.disabledBackButton) {
      props.changeDisabledBackButton(false);
    }

    // if final question, disable forward button else enable if disabled
    if (getPageNumber() === props.questions.length) {
      props.changeDisabledForwardButton(true);
    } else if (props.disabledForwardButton) {
      props.changeDisabledForwardButton(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      incrementQuestionTime();
    }, 1000);

    return () => clearInterval(interval);
  }, [incrementQuestionTime]);

  return (
    <div className="d-flex flex-column justify-content-center">
      <Carousel
        dots={false}
        ref={props.carouselRef}
        adaptiveHeight={true}
        className={styles["QAPanel-Carousel"]}
      >
        <Card hoverable className={`${styles["QAPanel-Card"]} p-3 pb-0 mt-5`}>
          <p className="text-center">
            Thank you for consenting to participate in our study! Following are
            some questions and their corresponding response, related to Opioid
            Use Disorder. Please read through them carefully. You may search the
            meaning of any unknown terms that appear throughout the document. As
            a reminder, your participation is entirely voluntary, and you may
            discontinue participation at any time. After going through the
            following content, you will be asked to answer a few questions to
            help us gauge your overall understanding.
          </p>
        </Card>
        {props.questions.map((data, index) => {
          return (
            <Card
              className={`${styles["QAPanel-Card"]} p-3 pb-0 w-100 h-100`}
              hoverable
              key={index}
              id={`question-${index + 1}`}
            >
              <Question
                questionNumber={index + 1}
                question={data["Question (Reddit post)"]}
                response={data["Reddit response"]}
              />
            </Card>
          );
        })}
        <Card hoverable className={`${styles["QAPanel-Card"]} p-3 pb-0 mt-5`}>
          <p className="text-center">
            Thank you so much for participating and going through the content
            and the quiz. Your participation is greatly appreciated and today's
            session is now complete.
          </p>
        </Card>
      </Carousel>
      <div className="pt-2 w-100 d-flex justify-content-center gap-2">
        <Button
          shape="circle"
          icon={<LeftOutlined />}
          disabled={props.disabledBackButton}
          onClick={goBack}
        />
        <Button
          shape="circle"
          icon={<RightOutlined />}
          disabled={props.disabledForwardButton}
          onClick={goForward}
        />
      </div>
      <div className="d-flex justify-content-center pt-5">
        {props.showQuizButton && (
          <Button
            onClick={() => {
              props.setIsModalOpen(true);
            }}
          >
            Start Quiz
          </Button>
        )}
      </div>
    </div>
  );
}
