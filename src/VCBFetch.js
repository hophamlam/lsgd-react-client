import moment from "moment";
import { useEffect, useState } from "react";
import {
  Card,
  Col,
  Container,
  Row,
  Stack,
  Button,
  Alert,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { Badge } from "react-bootstrap";
import { Nav } from "react-bootstrap";
import TransactionCard from "./TransactionCard";

//get today
var today = () => moment().format("DD/MM/YYYY");
var begin = () => moment().subtract(14, "days").format("DD/MM/YYYY");

var get14days = (day) => moment().subtract(day, "days").format("DD/MM/YYYY");

function parseDate(str) {
  var m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  return m ? new Date(m[3], m[2] - 1, m[1]) : null;
}

export default function Transactions() {
  const [loading, setLoading] = useState(false);
  const [server01Data, setServer01Data] = useState();
  const [groupData, setGroupData] = useState([]);
  const [refreshData, setRefreshData] = useState(false);

  const fetchData = async () => {
    const response = await fetch(process.env.REACT_APP_VCB_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        begin: begin(),
        end: today(),
        username: process.env.REACT_APP_VCB_USERNAME,
        password: process.env.REACT_APP_VCB_PASSWORD,
        accountNumber: process.env.REACT_APP_VCB_ACCOUNTNUMBER,
      }),
    });
    const { results } = await response.json();
    const sortedData = results.sort(function (a, b) {
      return (
        new Date(parseDate(b.TransactionDate)) -
        new Date(parseDate(a.TransactionDate))
      );
    });
    setServer01Data(sortedData);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [refreshData]);

  useEffect(() => {
    if (server01Data) {
      const groups = server01Data.reduce((groups, item) => {
        const date = item.TransactionDate;
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(item);
        return groups;
      }, {});
      setGroupData(groups);
    }
  }, [server01Data]);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setTimeout();
  //   });
  // });

  // const todayData = groupData[moment().subtract(0, "days").format("DD/MM/YYYY")];

  const transactionData = Object.keys(groupData).map((date) => {
    return { date, data: groupData[date] };
  });

  return (
    <Container className="mt-5">
      <Nav variant="pills" defaultActiveKey="/home">
        <Nav.Item>
          <Nav.Link>
            <Button
              className="button"
              variant="success"
              type="button"
              onClick={() => setRefreshData(!refreshData)}
            >
              Xem chuy???n kho???n Vietcombank
            </Button>
          </Nav.Link>
        </Nav.Item>

        <Nav.Item>
          <Nav.Link>
            <Link to="/MOMOFetch" className="mb-2 btn btn-danger">
              Xem chuy???n kho???n MOMO
            </Link>
          </Nav.Link>
        </Nav.Item>
      </Nav>
      <Row>
        {loading && (
          <p style={{ fontSize: "4rem" }}>?????i x??u, ??ang t???i giao d???ch...</p>
        )}

        {!loading &&
          transactionData.map((item, i) => {
            const olderDays = moment().diff(parseDate(item.date), "days");
            var dateCount =
              olderDays === 0 ? (
                <Alert variant="primary">???????????? H??m nay</Alert>
              ) : olderDays === 1 ? (
                <Alert variant="secondary">H??m qua</Alert>
              ) : (
                <Alert variant="secondary">{olderDays + " ng??y tr?????c"}</Alert>
              );

            return (
              <div key={i}>
                <h3 className="mt-4">{dateCount}</h3>
                <Row>
                  <TransactionCard key={i} post={item.data} />
                </Row>
              </div>
            );
          })}

        {/* {!loading &&
          server01Data.map((data, k) => {
            if (data.CD === "+") {
              //handle PCTime
              function zeroPad(num) {
                return num.toString().padStart(6, "0");
              }
              var validDate = moment(data.TransactionDate, "DD/MM/YYYY").format(
                "DD/MM/YYYY"
              );
              var validTime = moment(zeroPad(data.PCTime), "HH:mm:ss").format(
                "HH:mm:ss"
              );
              var validFullDateTime = moment(
                validDate + " " + validTime,
                "DD/MM/YYYY HH:mm:ss"
              );

              var validFullDateTimeString = validFullDateTime.format(
                "???????ddd, DD/MM/YYYY ???HH:mm:ss"
              );
              var momentFromNow = validFullDateTime.fromNow();

              //translate minutes ago...
              const momentFromNowTranslate = (moment) => {
                if (moment.includes("a few seconds ago") === true) {
                  return "v??i gi??y tr?????c";
                } else if (moment.includes("seconds ago") === true) {
                  return moment.replace("seconds ago", "gi??y tr?????c");
                } else if (moment.includes("1 minute ago") === true) {
                  return "1 ph??t tr?????c";
                } else if (moment.includes("minutes ago") === true) {
                  return moment.replace("minutes ago", "ph??t tr?????c");
                } else if (moment.includes("an hour ago") === true) {
                  return "1 gi??? tr?????c";
                } else if (moment.includes("hours ago") === true) {
                  return moment.replace("hours ago", "gi??? tr?????c");
                } else if (moment.includes("a day ago") === true) {
                  return "1 ng??y tr?????c";
                } else if (moment.includes("days ago") === true) {
                  return moment.replace("days ago", "ng??y tr?????c");
                } else if (moment.includes("a month ago") === true) {
                  return moment.replace("a month ago", "1 th??ng tr?????c");
                } else if (moment.includes("months ago") === true) {
                  return moment.replace("months ago", "th??ng tr?????c");
                }
              };

              //translate date
              const translateValidFullDate = (weekday) => {
                if (weekday.includes("Mon")) {
                  return weekday.replace("Mon", "Th??? Hai");
                } else if (weekday.includes("Tue")) {
                  return weekday.replace("Tue", "Th??? Ba");
                } else if (weekday.includes("Wed")) {
                  return weekday.replace("Wed", "Th??? T??");
                } else if (weekday.includes("Thu")) {
                  return weekday.replace("Thu", "Th??? N??m");
                } else if (weekday.includes("Fri")) {
                  return weekday.replace("Fri", "Th??? S??u");
                } else if (weekday.includes("Sat")) {
                  return weekday.replace("Sat", "Th??? B???y");
                } else if (weekday.includes("Sun")) {
                  return weekday.replace("Sun", "Ch??? Nh???t");
                }
              };

              //print if it's a new transaction
              const checkNewTransaction = (transdate) => {
                if (
                  moment().isBefore(moment(transdate).add(+20, "minutes")) ===
                  true
                ) {
                  return (
                    <Card.Header style={{ fontSize: "2rem" }}>
                      <Badge bg="warning">M???i</Badge>
                    </Card.Header>
                  );
                }
              };

            
                  // parsedDate <= new Date().getTime() &&
                  // parsedDate >=
                  // new Date(moment().subtract(2, "days").format()).getTime()

              //print cards
              return (
                <Col key={k} xs={12} md={4} lg={3}>
                  <Card
                    border="success"
                    style={{ width: "20rem", margin: "5px 5px 5px 5px" }}
                  >
                    {checkNewTransaction(validFullDateTime)}
                    <Card.Body>
                      <Badge bg="success">
                        <Card.Text style={{ fontSize: "2rem" }}>
                          Nh???n {data.Amount}??
                        </Card.Text>
                      </Badge>
                      <h4>
                        <Card.Text>
                          <Badge bg="secondary">
                            {momentFromNowTranslate(momentFromNow)}
                          </Badge>
                        </Card.Text>
                      </h4>
                      <Card.Text>
                        {translateValidFullDate(validFullDateTimeString)}
                      </Card.Text>
                     
                      <Card.Text>{data.Description}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              );
            }
          })} */}
      </Row>
    </Container>
  );
}
