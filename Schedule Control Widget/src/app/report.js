import PropTypes from "prop-types";
import React, {Component} from "react";
import Table from "@material-ui/core/Table";
import Selection from "@jetbrains/ring-ui/components/table/selection";
import Link from "@jetbrains/ring-ui/components/link/link";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import TableHead from "@material-ui/core/TableHead";
import TableContainer from "@material-ui/core/TableContainer";
import Paper from "@material-ui/core/Paper";
import TableBody from "@material-ui/core/TableBody";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Text from "@jetbrains/ring-ui/components/text/text";
import {getRegisterWidgetApiMock} from "@jetbrains/hub-widget-ui/src/test-mocks/test-mocks";
import {default as ReactDOM, render} from "react-dom";
import Widget from "./app";
import {getUtc} from "./date-helper";


export default class Report extends Component {
    static propTypes = {
        registerWidgetApi: PropTypes.func,
        reportData: PropTypes.array,
        dashboardApi: PropTypes.object,
        refreshReport: PropTypes.func,
        calculatedTime: PropTypes.number
    };


    constructor(props) {
        super(props);
        this.state = {
            isRefreshing: false,
            reportData: this.props.reportData,
            calculatedTime: this.props.calculatedTime
        };
        this.props.registerWidgetApi({
            onRefresh: () => {
                this.setState({isRefreshing: true});
                this.props.refreshReport().then(reportData => {
                    this.setState({reportData, calculatedTime: Date.now()});
                    this.setState({isRefreshing: false})
                }).catch(err => this.setState({isRefreshing: false}))
            }
        })
    }

    componentWillUnmount() {
        const props = this.props;
        props.registerWidgetApi({
            onRefresh: () => {
                ReactDOM.unmountComponentAtNode(document.getElementById('app-container'));
                render(
                    <Widget
                        dashboardApi={props.dashboardApi}
                        registerWidgetApi={props.registerWidgetApi}
                    />,
                    document.getElementById('app-container')
                );
            }
        })
    }

    getSumByPeriod = (period) => {
        const {reportData} = this.state;
        let sumPlan = 0;
        let sumFact = 0;
        reportData.map(user => user.periods).reduce(function (a, b) {
            return a.concat(b);
        }).filter(repPeriod => {
            return repPeriod.label === period.label
        }).forEach(period => {
            sumFact += period.fact ?? 0;
            sumPlan += period.plan
        });
        return {sumFact, sumPlan}
    };

    render() {
        const {reportData, calculatedTime} = this.state;
        const resultFactPlans = reportData[0].periods.map(period => this.getSumByPeriod(period));
        return (
            <div>
                <Text info>{`Report was calculated in ${new Date(calculatedTime).toLocaleString()}`}</Text>
                <TableContainer component={Paper}>
                    <Table size="small" aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>{"Full Name"}</TableCell>
                                {reportData[0].periods.map(period => <TableCell
                                    key={`${period.label}`}>{`${period.label}`}</TableCell>)}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reportData.map(user => {
                                return <TableRow key={user.fullName}>
                                    <TableCell>{user.fullName}</TableCell>
                                    {user.periods.map(period =>
                                        <TableCell key={`${period.label}`}>
                                            <TableRow>
                                                <TableCell>{"План"}</TableCell><TableCell>{"Факт"}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>{period.plan ?? 0}</TableCell>
                                                <TableCell><Text
                                                    style={{color: period.fact < period.plan || !period.fact ? "red" : "green"}}>{period.fact ? Math.round(period.fact) : 0}</Text></TableCell>
                                            </TableRow>
                                        </TableCell>)}
                                </TableRow>
                            })}
                            <TableRow><TableCell>{"Итого:"}</TableCell>{resultFactPlans.map(period => {
                                return <TableCell>
                                    <TableRow>
                                        <TableCell>{"План"}</TableCell><TableCell>{"Факт"}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>{period.sumPlan ?? 0}</TableCell>
                                        <TableCell><Text
                                            style={{color: period.sumFact < period.sumPlan || !period.sumFact ? "red" : "green"}}>{period.sumFact ? Math.round(period.sumFact) : 0}</Text></TableCell>
                                    </TableRow>
                                </TableCell>
                            })}</TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>)
    }
}
