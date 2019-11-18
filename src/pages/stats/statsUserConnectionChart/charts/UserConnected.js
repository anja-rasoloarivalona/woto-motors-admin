import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';

class UserConnection extends Component {
    state = {

        data: {
            labels: [],
            datasets: []
        },

        globalStatsDataSet: null,
        statsUserConnectionFilter: 'general', //general or by month
        statsUserConnectionFilterByMonth: null,

        statsUserConnectionFilterByMonthLabels: [],

        showUserConnectionFilterByMonthList: false,

        resData: null

    }

    componentDidMount(){
        this.selectUsersConnectionFilterGeneral(this.props.stats)
    }

    selectUsersConnectionFilterByMonth = monthAndYear => {   
            let dataset = this.state.globalStatsDataSet;
            let filterByMonth = monthAndYear;
            let filterByMonthData = {};

            dataset.forEach(data => {
                let monthAndYear = data.start.slice(3, 10);
                let fullDate = data.start.split(' ')[0];
            

                if(monthAndYear === filterByMonth){


                    if(!Object.keys(filterByMonthData).includes(fullDate)){
                        filterByMonthData[fullDate] = [data.userId]
                    }else {
                        if(!filterByMonthData[fullDate].includes(data.userId)){
                            filterByMonthData[fullDate] = [...filterByMonthData[fullDate], data.userId]
                        }
                    }
                }
            })


            let numberOfConnectedUsers = [];
            let labels = [];
            

            Object.keys(filterByMonthData).forEach(data => {
                numberOfConnectedUsers.push(filterByMonthData[data].length)
                labels.push(data.slice(0, 5))
            })

            let data = {
                labels: labels,
                datasets: [
                    {
                        label: 'Number of connections',
                        data: numberOfConnectedUsers,
                        backgroundColor: 'transparent'
                    }
                ]
            }   
            this.setState({ statsUserConnectionFilter: 'byMonth', showUserConnectionFilterByMonthList: true, data: data})    
    }

    selectUsersConnectionFilterByMonthHandler = monthAndYear => {
        this.setState({ statsUserConnectionFilterByMonth : monthAndYear} , () => this.selectUsersConnectionFilterByMonth(monthAndYear))
    }


    selectUsersConnectionFilterGeneral = stats => {
        //Storing all the connection dataset
        let globalStatsDataSet = []


        stats.forEach(userStat => {
            userStat.connection.forEach(connection => {
                connection = {
                    ...connection,
                    userId: userStat._id
                }
                globalStatsDataSet.push(connection)
            })
        });



        //Built labels
        let generalLabelsFullDate = [];
        let generalLabelsShortDate = {};

        let statsUserConnectionFilterByMonthLabels = [];


        globalStatsDataSet.forEach(data => {
            let fullDate = data.start.split(' ')[0];
            let shortDate = fullDate.slice(0, 5);
            let monthAndYear = fullDate.slice(3, 10)

            if(!generalLabelsFullDate.includes(fullDate)){
                generalLabelsFullDate = [...generalLabelsFullDate, fullDate]


                generalLabelsShortDate[shortDate] = [data.userId];

            } else {

                if(!generalLabelsShortDate[shortDate].includes(data.userId)){
                    generalLabelsShortDate[shortDate] = [...generalLabelsShortDate[shortDate], data.userId]
                 }

            }

            if(!statsUserConnectionFilterByMonthLabels.includes(monthAndYear)){
                statsUserConnectionFilterByMonthLabels.push(monthAndYear)
            }
        })


        let statsUserConnectionFilterByMonth = statsUserConnectionFilterByMonthLabels[0]


        let numberOfConnectedUsers = [];
        Object.keys(generalLabelsShortDate).forEach(shortDate => {
            numberOfConnectedUsers.push(generalLabelsShortDate[shortDate].length)
        })



        let data = {
            labels: Object.keys(generalLabelsShortDate),
            datasets: [
                {
                    label: 'Number of connections',
                    data: numberOfConnectedUsers,
                    backgroundColor: 'transparent'
                }
            ]
        }
        this.setState({ 
                        data: data, 
                        resData: stats,
                        globalStatsDataSet: globalStatsDataSet,
                        statsUserConnectionFilterByMonthLabels: statsUserConnectionFilterByMonthLabels, 
                        statsUserConnectionFilterByMonth: statsUserConnectionFilterByMonth,
                        statsUserConnectionFilter: 'general',
                        showUserConnectionFilterByMonthList: false}, () => console.log(this.state))
    }



    render() {
        const {statsUserConnectionFilterByMonthLabels, statsUserConnectionFilter, showUserConnectionFilterByMonthList, statsUserConnectionFilterByMonth, resData} = this.state;

        return (
            <section className="stats__usersConnection">
                <h1 className="app__primary__title">Users Connected</h1>
                <div className="stats__userConnection__container">  

                    <div className="stats__userConnection__filter">
                        <h2 className="stats__userConnection__filter__title">Filtre</h2>
                        <ul className="stats__userConnection__filter__list">

                            <li className={`stats__userConnection__filter__list__item
                                        ${statsUserConnectionFilter === 'general' ? 'active': ''}`}
                                onClick={() => this.selectUsersConnectionFilterGeneral(resData)}>
                                    general
                            </li>

                            <li className={`stats__userConnection__filter__list__item
                                        ${statsUserConnectionFilter === 'byMonth' ? 'active': ''}`}
                                onClick={() => this.selectUsersConnectionFilterByMonth(statsUserConnectionFilterByMonth)}>
                                <div className="stats__userConnection__filter__list__item__key">Par mois</div>
                                <div className="stats__userConnection__filter__list__item__value">{statsUserConnectionFilterByMonth}</div>
                                <ul className={`stats__userConnection__filter__byMonthList
                                                ${showUserConnectionFilterByMonthList === true ? 'shown' : ''}`}>
                                    {statsUserConnectionFilterByMonthLabels.map(label => (
                                        <li key={label}
                                            onClick={() => this.selectUsersConnectionFilterByMonthHandler(label)} 
                                            className={`stats__userConnection__filter__byMonthList__item
                                                        ${statsUserConnectionFilterByMonth === label ? 'active' : ''}`}>
                                            {label}
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        </ul>
                    </div>     
                
                    <div className="stats__userConnection__chartContainer">
                        <Line 
                            options={{
                                    responsive: true,
                                    scales: {
                                        yAxes: [{
                                            ticks: {
                                                beginAtZero: true,
                                                stepSize: 1
                                            }
                                        }]
                                    }
                            }}
                            data={this.state.data}
                        />  
                    </div>   
                </div>
            </section>
        )
    }
}


export default UserConnection;
