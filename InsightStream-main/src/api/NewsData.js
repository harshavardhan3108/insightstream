// import useNewsDataApiClient from "newsdataapi";

// const { latest } = useNewsDataApiClient("pub_9cdacaf3abf94b7a9b590b4a7856d0d8");

// let allNews = [];
// let nextPage;

// while (true) {
//   const params = { q: "ronaldo", country: "us" };
//   if (nextPage) params.page = nextPage;

//   const data = await latest(params);

//   if (data?.results?.length) {
//     allNews.push(...data.results);
//   }

//   if (!data.nextPage) break;

//   nextPage = data.nextPage;
// }
// console.log(allNews);
// export default allNews;

