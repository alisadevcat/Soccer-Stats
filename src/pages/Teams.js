// - Список команд

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Preloader from "../components/PreLoader";
import { Link } from "react-router-dom";
import Pagination from "../components/Pagination";
import Search from "../components/Search";

const Teams = () => {
  const teamsUrl = "http://api.football-data.org/v2/teams";
  const apiKey = process.env.DOTENV.API_KEY;
  const perPage = 10;
  const defaultPage = { pageNumber: 1, isActive: true };

  const [teams, setTeams] = useState([]);
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(defaultPage);
  const [displayedTeams, setDisplayedTeams] = useState(teams.slice(0, perPage));
  const [totalRecords, setTotalRecords] = useState(teams.length);

  useEffect(getTeams, []);

  function getTeams() {
    axios({
      method: "get",
      url: `${teamsUrl}`,
      headers: { "X-Auth-Token": `${apiKey}` },
    })
      .then((response) => {
        let teamsPosts = response.data?.teams.map((item) => {
          const { id, name, crestUrl } = item;
          return (item = { id: id, name: name, crestUrl: crestUrl });
        });
        setTeams(teamsPosts);
        setDisplayedTeams(teamsPosts.slice(0, perPage));
        setTotalRecords(teamsPosts.length);
      })
      .catch((error) => {
        setError("Error Occured");
        console.log(error);
      })
      .finally(() => {
        setIsLoaded(true);
      });
  }

  // Search
  const searchSubmitHandler = (postObj) => {
    let search_results = [];

    setError(null);

    postObj.result_posts.forEach((item_id, index) => {
      teams.forEach((item) => {
        if (item.id == item_id) {
          search_results.push(item);
        }
      });
    });

    if (postObj.no_results_text) {
      setError(postObj.no_results_text);
    }

    setDisplayedTeams(search_results.slice(0, perPage));
    setTotalRecords(search_results.length);
  };

// Pagination
  const pageClickHandler = (page) => {
    setDisplayedTeams(pages);
    setCurrentPage(page);
  };

  const paginationObject = {
    perPage: perPage,
    currentPage: currentPage,
    totalRecords: totalRecords,
  };

  const paginate = (teams, currentPage, perPage) => {
    let from = currentPage.pageNumber * perPage - perPage;
    let to = currentPage.pageNumber * perPage;
    return teams.slice(from, to);
  };

  const pages = useMemo(() => {
    return paginate(teams, currentPage, perPage);
  }, [teams, currentPage, perPage]);



  if (error) {
    return (
      <div className="container">
        <h1>Teams</h1>
        <Search posts={teams} handleSearchSubmit={searchSubmitHandler} />
        <div className="container text-center">
          <h4> Error: {error} </h4>{" "}
        </div>
      </div>
    );
  } else if (!isLoaded) {
    return (
      <div className="container spinner-container">
        <Preloader />
      </div>
    );
  } else {
    return (
      <div className="container">
        <h1>Teams</h1>
        <Search posts={teams} handleSearchSubmit={searchSubmitHandler} />

        <div className="team-cards">
          {displayedTeams &&
            displayedTeams.map((team) => (
              <div className="card" key={team.id}>
                <Link to={`/teams/${team.id}`}>
                  <div className="card-content">
                    <p className="card-title">League: {team.name}</p>
                    <figure className="card-image">
                      <img
                        src={team.crestUrl}
                        alt={team.name}
                        width="96"
                        height="96"
                      />
                    </figure>
                  </div>
                </Link>
              </div>
            ))}
        </div>
        <Pagination
          paginationObject={paginationObject}
          onPageClicked={pageClickHandler}
        />
      </div>
    );
  }
}

export default Teams;