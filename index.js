import 'dotenv/config';
import { Client } from '@notionhq/client';
import { format } from '@formkit/tempo';

const notionCl = new Client({
  auth: process.env.NOTION_KEY,
});

// const ROOT_PAGE_ID = process.env.NOTION_PAGE_ID;
// const TUTORS_DB_ID = process.env.NOTION_TUTORS_DATABASE_ID;
const TEAM_LEADERS_DB_ID = process.env.NOTION_TEAM_LEADERS_DATABASE_ID;
const TUTORS_TRACKING_DB_ID = process.env.NOTION_TUTORS_TRACKING_DATABASE_ID;
const PAGE_DAILY_WAGE_TUTORS_CONSTANT_ID =
  process.env.NOTION_DAILY_WAGE_TUTORS_CONSTANT_PAGE_ID;

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

  // console.log();
  // console.log({ teampLeadersDbQueryResponse });
  // console.log();

  // Create a tutor tracking record for each team leader and their assigned tutors
  const teamLeaderPages = teampLeadersDbQueryResponse.results;
  for (const teamLeaderPage of teamLeaderPages) {
    const {
      'Assigned Tutors': { relation: assignedTutorPageReferences },
    } = teamLeaderPage.properties;

    const teamLeaderPageTitle = await getPageTitleProperty(teamLeaderPage.id);
    console.log('*------------------*');
    console.log('Team Leader: ' + teamLeaderPageTitle);

    for (const assignedTutorPageReference of assignedTutorPageReferences) {
      const assignedTutorPageTitle = await getPageTitleProperty(
        assignedTutorPageReference.id
      );
      console.log(
        'Creating tracking record for tutor: ' + assignedTutorPageTitle
      );
      await createTutorTrackingPage({
        teamLeaderPageId: teamLeaderPage.id,
        tutorPageId: assignedTutorPageReference.id,
        date: new Date(), // TODO: Change this to be dynamic
      });
    }
    console.log('*------------------*');
  }
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
      type: 'database_id',
      database_id: TUTORS_TRACKING_DB_ID,
    },
    icon: {
      type: 'external',
      external: {
        url: 'https://www.notion.so/icons/target_gray.svg?mode=light',
      },
    },
    properties: {
      Date: {
        type: 'date',
        date: {
          start: format(date, 'YYYY-MM-DD'),
        },
      },
      Day: {
        type: 'title',
        title: [
          {
            type: 'text',
            text: {
              content: '[BOT] Day ',
            },
          },
          {
            type: 'mention',
            mention: {
              type: 'date',
              date: {
                start: format(date, 'YYYY-MM-DD'),
                end: null,
              },
            },
          },
        ],
      },
      'Team Leader': {
        type: 'relation',
        relation: [
          {
            id: teamLeaderPageId,
          },
        ],
      },
      Tutor: {
        type: 'relation',
        relation: [
          {
            id: tutorPageId,
          },
        ],
      },
      'Constants DB': {
        type: 'relation',
        relation: [
          {
            id: PAGE_DAILY_WAGE_TUTORS_CONSTANT_ID,
          },
        ],
      },
    },
  });
}

/**
 *
 * @param {string} pageId
 * @returns {Promise<string>}
 */
async function getPageTitleProperty(pageId) {
  const pageTitlePropertyResponse = await notionCl.pages.properties.retrieve({
    page_id: pageId,
    property_id: 'title',
  });
  return pageTitlePropertyResponse.results[0].title.text.content;
}
