import 'dotenv/config';
import { Client } from '@notionhq/client';

const notionCl = new Client({
  auth: process.env.NOTION_KEY,
});

const ROOT_PAGE_ID = process.env.NOTION_PAGE_ID;
const TUTORS_DB_ID = process.env.NOTION_TUTORS_DATABASE_ID;

async function main() {
  // // Retrieve a specific page info
  // const pageResponse = await notionCl.pages.retrieve({
  //   page_id: ROOT_PAGE_ID,
  // });
  // console.log();
  // console.log(pageResponse);
  // console.log();
  //
  // Retrieve blocks of a page
  // const blocksResponse = await notionCl.blocks.children.list({
  //   block_id: ROOT_PAGE_ID,
  // });
  // const mappedBlocksResult = blocksResponse.results.map(
  //   (result) => result.type
  // );
  // console.log();
  // console.log({ resultsLength: blocksResponse.results.length });
  // console.log(blocksResponse);
  // console.log(mappedBlocksResult);
  // console.log();

  // Fetch non-archived Tutors DB
  const tutorsDbQueryResponse = await notionCl.databases.query({
    database_id: TUTORS_DB_ID,
    filter: {
      property: 'Archived',
      checkbox: {
        equals: false,
      },
    },
  });

  console.log();
  console.log(tutorsDbQueryResponse);
  console.log();
}

main();
