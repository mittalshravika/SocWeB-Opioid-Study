import NavigationMenu from "../components/NavigationMenu/NavigationMenu";
import {
  questionMenuItems,
  questionMenuDefaultOpenKeys,
  helpMenuItems,
  helpMenuDefaultOpenKeys,
} from "../components/NavigationMenu/MenuItems";
import { useEffect, useRef, useState } from "react";
import { useAnalytics } from "../analytics/AnalyticsProvider";
import QAPanel from "../components/QA Panel/QAPanel";
import axios from "axios";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { COMPLETION_LINKS } from "../data/completionLinks";
import Quiz from "../components/Quiz/Quiz";
import { Button, Tooltip } from "antd";

const STARTING_QA_PANEL_TEXT = (
  <>
    Hello, <br />
    Thank you for consenting to participate in our study! <br /> <br />
    <span className="underline">What to do:</span> Please carefully read through
    the following questions and their corresponding responses, related to opioid
    use disorder (OUD). Navigate through the questions using the left/right
    arrow buttons (
    <Button shape="circle" icon={<LeftOutlined />} size="small" />
    <Button shape="circle" icon={<RightOutlined />} size="small" />
    ) provided below. <br /> <br />
    You may search the meaning of any unknown terms that appear using search
    engines such as Google. As and when applicable, we also provide a brief
    description of OUD related terms. The description can
    be accessed by{" "}
    <Tooltip title="Hover to get a brief description of the word/phrase">
      <i>hovering</i>
    </Tooltip>{" "}
    over the italicized terms. You may zoom in/out of the content
    (increase/decrease the font size) using the +/- buttons (
    <Button size="small">+</Button> <Button size="small">-</Button>). <br />{" "}
    <br />
    <span className="underline">What not to do:</span>
    {""} Please refrain from using any large language model or generative AI
    powered search tools such as ChatGPT or Google Bard. We also ask that you
    restrict yourself from consuming any other OUD-related content other than
    what is being provided to you. <br />
    <br />
    <span className="underline">Required Quiz and Compensation:</span> After
    reading through the questions and their responses, please complete the short
    “required” quiz. The quiz can be accessed by clicking on the “start quiz”
    button (
    <Button size="small" type="primary">
      Start Quiz
    </Button>
    ), which appears after navigating through all the questions. Successful
    completion of reading the content and taking the quiz would provide a daily
    compensation of $2, amounting to a total of $30 for the entire duration of
    two weeks. <br /> <br />
    <span className="underline">Helplines and Contact Information:</span> {""}
    As a reminder, your participation is entirely voluntary and you may
    discontinue participation at any time. If at any point in this study, you
    feel distressed, please call the Substance Abuse and Mental Health Services
    Administration (SAMHSA) National Helpline at 1-800-662-HELP (4357). The
    Helpline is free and available 24/7 and can help you find local resources to
    help with any mental health or substance use concerns. You can also find an
    online listing of treatment programs in your area through the{" "}
    <a href="https://findtreatment.gov/" target="_blank" rel="noreferrer">
      SAMHSA Treatment Services Locator
    </a>
    . If you have any questions about the study, you may contact our research
    team at <a href="mailto:smittal87@gatech.edu">smittal87@gatech.edu</a>.
    Additionally, if you have any questions about your rights as a research
    participant, you may contact the Georgia Institute of Technology Office of
    Research Integrity Assurance at{" "}
    <a href="mailto:IRB@gatech.edu" target="_blank" rel="noreferrer">
      IRB@gatech.edu
    </a>
    . <br /> <br />
    Thank you for your time and participation!
  </>
);

/**
 * This component is used to display the main page
 * @returns Main Page
 */
export default function Main() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const carouselRef = useRef<any>(null);
  const {
    initializeQuestionAnalytics,
    incrementHelplineClicks,
    incrementDirectClicks,
    incrementHomePageClicks,
    setPageNumber,
    pageNumber,
  } = useAnalytics();
  const disabledBackButton = questions.length === 0 || pageNumber === 0;
  const disabledForwardButton =
    questions.length === 0 || pageNumber === questions.length;
  const showQuizButton =
    questions.length !== 0 && pageNumber === questions.length;

  const params = new URL(window.location.toString()).searchParams;
  const day = params.get("day");
  const version = params.get("version");

  const dayToCompletionText: { [key: string]: (link: string) => JSX.Element } =
    {
      "1": (link: string) => (
        <>
          Thank you so much for participating and going through the content and
          the quiz. Your participation is greatly appreciated. <br /> <br />{" "}
          <span className="fw-bold">
            Please click this link <a href={link}>{link}</a> to take the final
            survey and complete your session on Prolific.
          </span>
        </>
      ),
    };

  const questionMenu = questionMenuItems(questions, showQuizButton);
  const ENDING_QA_PANEL_TEXT =
    day && day in dayToCompletionText ? (
      dayToCompletionText[day](COMPLETION_LINKS[`day${day}Version${version}`])
    ) : (
      <>
        Thank you so much for participating and going through the content and
        the quiz. Your participation is greatly appreciated. <br /> <br />
        <span className="fw-bold">
          Please click this link{" "}
          <a href={COMPLETION_LINKS[`day${day}Version${version}`]}>
            {COMPLETION_LINKS[`day${day}Version${version}`]}
          </a>{" "}
          to complete your session on Prolific.{" "}
        </span>
      </>
    );

  /**
   * This useEffect is used to get the questions from the backend and set the questions, the question menu, and initialize the question analytics.
   * It also sets the showQuizButton state is it is the first time getting called.
   * @throws error if no questions are found for the day
   */
  useEffect(() => {
    // get the questions from the backend
    axios.get("api/questions?day=" + day).then((res) => {
      if (res.data.length === 0) {
        throw new Error("No questions found for day: " + day);
      }
      setQuestions(res.data);
      initializeQuestionAnalytics(res.data);
    });
  }, [initializeQuestionAnalytics, day]);

  /**
   * Navigation menu click handler that handles the click of the menu items and opens the corresponding page.
   * @param event the event that is triggered when a menu item is clicked
   * @throws error if an invalid menu item is clicked
   */
  const menuClickHandler = (event: { key: string }) => {
    switch (event.key) {
      case "treatments":
        window.open("https://findtreatment.gov/");
        incrementHelplineClicks();
        break;
      case "home":
        // 0 is the home page number
        carouselRef.current.goTo(0);
        setPageNumber(0);
        incrementHomePageClicks();
        break;
      case event.key.startsWith("Question:") ? event.key : "":
        handleQuestionMenuClick(event.key);
        break;
      case "quiz":
        setIsModalOpen(true);
        break;
      default:
        throw new Error("Invalid menu item clicked: " + event.key);
    }
  };

  /**
   * Handles the click of the question menu items and opens the corresponding question and increments all analytics relevant
   * @param key the key of the question menu item that was clicked
   * @throws error if an invalid question number is clicked
   */
  const handleQuestionMenuClick = (key: string) => {
    const questionNumber = parseInt(key.split(":")[1]);

    if (questionNumber < 0 || questionNumber > questions.length) {
      throw new Error("Invalid question number clicked: " + questionNumber);
    }

    // Go to the selected question
    carouselRef.current.goTo(questionNumber);
    setPageNumber(questionNumber);

    // Increment the direct clicks for the question
    incrementDirectClicks(questionNumber - 1);
  };

  return (
    <div className="container-fluid h-100">
      <Quiz
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        carouselRef={carouselRef}
      />
      <div className="row">
        <section className="col-2 d-none d-lg-flex justify-content-center p-2">
          <NavigationMenu
            menuItems={questionMenu}
            defaultOpenKeys={questionMenuDefaultOpenKeys}
            clickHandler={menuClickHandler}
          />
        </section>
        <section className="col-sm-12 col-lg-8 d-flex justify-content-center flex-column h-100">
          <QAPanel
            startingText={STARTING_QA_PANEL_TEXT}
            endingText={ENDING_QA_PANEL_TEXT}
            displayItemHeading={"Question"}
            displayItemSubHeading={"Response"}
            displayItems={questions}
            carouselRef={carouselRef}
            setIsModalOpen={setIsModalOpen}
            disabledForwardButton={disabledForwardButton}
            disabledBackButton={disabledBackButton}
            showQuizButton={showQuizButton}
          />
        </section>
        <section className="col-2 d-none d-lg-flex justify-content-center p-2">
          <NavigationMenu
            menuItems={helpMenuItems}
            defaultOpenKeys={helpMenuDefaultOpenKeys}
            clickHandler={menuClickHandler}
          />
        </section>
      </div>
    </div>
  );
}
