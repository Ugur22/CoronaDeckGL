import React, { Component } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, Brush, Text, ResponsiveContainer } from "recharts";
import axios from "axios";
import moment from "moment";

let countryName, dataType, data, color;


export default class Detailgraph extends Component {

    constructor(props) {
        super(props);

        this.state = {
            countryName: "",
            data: [],
            color: ""
        };
        this.container = React.createRef();
    }

    xAxisTickFormatter(timestamp_measured) {

        return moment(timestamp_measured)
            .format("ll")
            .slice(0, 6);
    }

    componentDidMount() {
        let country = this.props.clickedObject.country;
        dataType = this.props.dataType;

        country = (country === "S. Korea" ? "korea-south" : country === "UK" ? "united-kingdom" : country);

        this.setState({
            countryName: country
        });

        dataType = (dataType === "cases" ? "confirmed" : dataType);

        color = (dataType === "confirmed" ? "#f39c12" : dataType === "deaths" ? "#a50f15" : "#006d2c");
        axios.all([
            axios.get(`https://api.covid19api.com/total/country/${country}/status/${dataType}`)])
            .then(axios.spread((countryData) => {
                data = countryData.data;
                this.setState({
                    data: data
                });
            })).catch((error) => {
                console.log(error); return [];
            })
        this.setFilters();
    }

    setFilters() {
        data = this.state.data;
    }

    CustomTooltip = ({ active, payload, label }) => {
        let dateTip = moment(label)
            .format("llll")
            .slice(0, 10);
        let formattedDate = dateTip
        if (payload) {
            if (active) {
                return (
                    <div className="custom-tooltip">
                        <p className="label-tooltip">{`${formattedDate}`}</p>
                        <p className="desc-tooltip">
                            <span className="value-tooltip">{` Cases: ${payload[0].value}`}</span>
                        </p>
                    </div>
                );
            }
        }
        return null;
    };

    render() {
        countryName = this.state.countryName;
        return (
            <div ref={e => (this.container = e)}>
                {this.state.data ? (
                    <div className="panel-description">
                        <h1 className="panel-header">{countryName}</h1>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} margin={{ top: 5, right: 70, left: 50, bottom: 5 }}>
                                <XAxis dataKey="Date" padding={{ left: 5 }} tickFormatter={this.xAxisTickFormatter} tickSize={4} dx={8} allowDataOverflow={true} />
                                <YAxis type="number" domain={[0, 10]} orientation='left' tick={{ color: "red" }}
                                    label={<Text style={{ fontSize: '22px', fontWeight: 'bold', fill: color }} x={0} y={0} dx={20} dy={150} offset={0} angle={-90}>Cases</Text>} />
                                <Tooltip content={this.CustomTooltip} animationDuration={0} />
                                <Line margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                    dataKey="Cases" stroke={color} type="natural" dot={false} travellerWidth={4} strokeWidth={1}
                                    activeDot={{ fill: "#000000", stroke: "#FFFFFF", strokeWidth: 1, r: 5 }} />
                                <Brush dataKey="Date" tickFormatter={this.xAxisTickFormatter} height={40} stroke={color}>
                                    <LineChart>
                                        <YAxis tick={false} width={0} hide domain={["auto", "auto"]} />
                                        <Line type="natural" dataKey="Cases" stroke={color} name="cases" dot={false} />
                                    </LineChart>
                                </Brush>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                        <div className="loading">
                            <img src="asset/img/loader.gif" alt="Loading animation" />
                             Loading...
                        </div>
                    )}
            </div>
        );
    }

}