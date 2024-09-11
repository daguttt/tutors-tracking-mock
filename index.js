import 'dotenv/config';
import { Client } from '@notionhq/client';

const notionCl = new Client({
  auth: process.env.NOTION_KEY,
});

// const ROOT_PAGE_ID = process.env.NOTION_PAGE_ID;
// const TUTORS_DB_ID = process.env.NOTION_TUTORS_DATABASE_ID;
const TEAM_LEADERS_DB_ID = process.env.NOTION_TEAM_LEADERS_DATABASE_ID;
const TUTORS_TRACKING_DB_ID = process.env.NOTION_TUTORS_TRACKING_DATABASE_ID;

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
  // const tutorsDbQueryResponse = await notionCl.databases.query({
  //   database_id: TUTORS_DB_ID,
  //   filter: {
  //     property: 'Archived',
  //     checkbox: {
  //       equals: false,
  //     },
  //   },
  // });

  // console.log();
  // console.log(tutorsDbQueryResponse);
  // console.log();

  // Fetch non-archived Team Leaders DB
  const teampLeadersDbQueryResponse = await notionCl.databases.query({
    database_id: TEAM_LEADERS_DB_ID,
    filter: {
      property: 'Archived',
      checkbox: {
        equals: false,
      },
    },
  });

  console.log();
  console.log(teampLeadersDbQueryResponse);
  console.log();

  // Create a tutor tracking record for each team leader and their assigned tutors
  (async () => {
    const teamLeaderPages = teampLeadersDbQueryResponse.results;
    for (const teamLeadesPage of teamLeaderPages) {
      const {
        'Assigned Tutors': { relation: assignedTutorPageReferences },
      } = teamLeadesPage.properties;

      for (const assignedTutorPageReference of assignedTutorPageReferences) {
        await createTutorTrackingPage({
          teamLeaderPageId: teamLeadesPage.id,
          tutorPageId: assignedTutorPageReference.id,
          date: new Date(),
        });
      }
    }
  })();
}

main();

/**
 *
 * @param {{teamLeaderPageId: string, tutorPageId: string, date: Date}} param0
 */
async function createTutorTrackingPage({
  teamLeaderPageId,
  tutorPageId,
  date,
}) {
  await notionCl.pages.create({
    parent: {
      database_id: TUTORS_TRACKING_DB_ID,
    },
    properties: {
      'Team Leader': {
        type: 'relation',
        relation: {
          id: teamLeaderPageId,
        },
      },
      Tutor: {
        type: 'relation',
        relation: {
          id: tutorPageId,
        },
      },
      Date: {
        type: 'date',
        date: {
          start: date.toISOString(),
        },
      },
    },
  });
}
